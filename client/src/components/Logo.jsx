const Logo = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 220"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Exquisite Craft"
  >
    {/* Oval border */}
    <ellipse cx="100" cy="95" rx="72" ry="90" fill="#8B5E3C" stroke="#f5ede3" strokeWidth="2.5" />

    {/* E letter */}
    <text
      x="62"
      y="105"
      fontFamily="Georgia, serif"
      fontSize="72"
      fontWeight="bold"
      fill="#f5ede3"
      letterSpacing="-2"
    >
      E
    </text>

    {/* C letter overlapping */}
    <text
      x="88"
      y="118"
      fontFamily="Georgia, serif"
      fontSize="72"
      fontWeight="bold"
      fill="#f5ede3"
      letterSpacing="-2"
    >
      C
    </text>

    {/* Exquisite Craft script text */}
    <text
      x="100"
      y="200"
      fontFamily="'Dancing Script', 'Brush Script MT', cursive"
      fontSize="22"
      fill="#3A2F35"
      textAnchor="middle"
    >
      Exquisite Craft
    </text>
  </svg>
);

export default Logo;
