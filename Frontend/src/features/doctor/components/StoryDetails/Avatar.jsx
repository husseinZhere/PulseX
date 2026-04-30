const Avatar = ({ img, initials, size = 'w-10 h-10' }) =>
  img ? (
    <img src={img} alt={initials} className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold`}>
      {initials}
    </div>
  );

export default Avatar;
