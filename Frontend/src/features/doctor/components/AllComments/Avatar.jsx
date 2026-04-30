const Avatar = ({ img, initials, size = 'w-10 h-10' }) =>
  img ? (
    <img src={img} alt={initials} className={`${size} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold shrink-0`}>
      {initials}
    </div>
  );

export default Avatar;
