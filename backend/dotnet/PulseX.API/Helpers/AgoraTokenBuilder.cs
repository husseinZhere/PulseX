using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;

namespace PulseX.API.Helpers
{
    /// <summary>
    /// Agora AccessToken2 (version "007") generator for the RTC service, built with
    /// an integer UID. Faithfully mirrors Agora's reference RtcTokenBuilder2 /
    /// AccessToken2 implementation (little-endian packing, two-step HMAC signing key,
    /// pack_string(signature) + signing_info, zlib-compressed, base64-encoded).
    /// </summary>
    public static class AgoraTokenBuilder
    {
        private const string Version = "007";
        private const ushort ServiceTypeRtc = 1;

        private const ushort PrivilegeJoinChannel = 1;
        private const ushort PrivilegePublishAudioStream = 2;
        private const ushort PrivilegePublishVideoStream = 3;
        private const ushort PrivilegePublishDataStream = 4;

        public static string BuildTokenWithUid(
            string appId,
            string appCertificate,
            string channelName,
            uint uid,
            uint tokenExpireSeconds = 3600)
        {
            uint issueTs = (uint)DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            uint salt = (uint)Random.Shared.Next(1, int.MaxValue);
            return BuildCore(appId, appCertificate, channelName, uid, tokenExpireSeconds, issueTs, salt);
        }

        // Deterministic core (fixed issueTs + salt) — used by BuildTokenWithUid and
        // by cross-checks against Agora's reference implementation.
        internal static string BuildCore(
            string appId,
            string appCertificate,
            string channelName,
            uint uid,
            uint tokenExpireSeconds,
            uint issueTs,
            uint salt)
        {
            uint expire = tokenExpireSeconds; // expiry is a DURATION in seconds (server adds issueTs)

            // ── RTC service body: type + privileges map + channel + uid ──
            byte[] serviceBytes;
            using (var ms = new MemoryStream())
            using (var w = new BinaryWriter(ms, Encoding.UTF8, leaveOpen: true))
            {
                w.Write(ServiceTypeRtc); // uint16 service type

                var privileges = new SortedDictionary<ushort, uint>
                {
                    { PrivilegeJoinChannel,        expire },
                    { PrivilegePublishAudioStream, expire },
                    { PrivilegePublishVideoStream, expire },
                    { PrivilegePublishDataStream,  expire },
                };
                w.Write((ushort)privileges.Count);
                foreach (var kv in privileges)
                {
                    w.Write(kv.Key);   // uint16 privilege
                    w.Write(kv.Value); // uint32 expire
                }

                WriteString(w, Encoding.UTF8.GetBytes(channelName));
                WriteString(w, Encoding.UTF8.GetBytes(uid == 0 ? string.Empty : uid.ToString()));
                w.Flush();
                serviceBytes = ms.ToArray();
            }

            // ── signing_info = string(appId) + issueTs + expire + salt + serviceCount + service ──
            byte[] signingInfo;
            using (var ms = new MemoryStream())
            using (var w = new BinaryWriter(ms, Encoding.UTF8, leaveOpen: true))
            {
                WriteString(w, Encoding.UTF8.GetBytes(appId));
                w.Write(issueTs);
                w.Write(expire);
                w.Write(salt);
                w.Write((ushort)1); // one service (RTC)
                w.Write(serviceBytes);
                w.Flush();
                signingInfo = ms.ToArray();
            }

            // ── signing key: HMAC(issueTs, cert) → HMAC(salt, prev) ──
            byte[] signing = HmacSha256(PackUint32(issueTs), Encoding.UTF8.GetBytes(appCertificate));
            signing = HmacSha256(PackUint32(salt), signing);

            // ── signature over signing_info ──
            byte[] signature = HmacSha256(signing, signingInfo);

            // ── content = string(signature) + signing_info ──
            byte[] content;
            using (var ms = new MemoryStream())
            using (var w = new BinaryWriter(ms, Encoding.UTF8, leaveOpen: true))
            {
                WriteString(w, signature);
                w.Write(signingInfo);
                w.Flush();
                content = ms.ToArray();
            }

            return Version + Convert.ToBase64String(ZlibCompress(content));
        }

        private static byte[] HmacSha256(byte[] key, byte[] message)
        {
            using var hmac = new HMACSHA256(key);
            return hmac.ComputeHash(message);
        }

        // Little-endian uint32 (matches Agora's struct.pack('<I')).
        private static byte[] PackUint32(uint value)
        {
            var bytes = BitConverter.GetBytes(value);
            if (!BitConverter.IsLittleEndian) Array.Reverse(bytes);
            return bytes;
        }

        private static void WriteString(BinaryWriter w, byte[] bytes)
        {
            w.Write((ushort)bytes.Length);
            w.Write(bytes);
        }

        private static byte[] ZlibCompress(byte[] data)
        {
            using var output = new MemoryStream();
            output.WriteByte(0x78);
            output.WriteByte(0x9C);

            using (var deflate = new DeflateStream(output, CompressionLevel.Optimal, leaveOpen: true))
                deflate.Write(data, 0, data.Length);

            uint adler = ComputeAdler32(data);
            output.WriteByte((byte)(adler >> 24));
            output.WriteByte((byte)(adler >> 16));
            output.WriteByte((byte)(adler >> 8));
            output.WriteByte((byte)(adler & 0xFF));

            return output.ToArray();
        }

        private static uint ComputeAdler32(byte[] data)
        {
            const uint mod = 65521;
            uint a = 1, b = 0;
            foreach (var by in data)
            {
                a = (a + by) % mod;
                b = (b + a) % mod;
            }
            return (b << 16) | a;
        }
    }
}
