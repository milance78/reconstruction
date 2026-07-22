import * as React from "react";
import { NavLink } from "react-router-dom";

import ProfileMenu from "../profileMenu/ProfileMenu";

import "./Header.scss";

const Header = () => {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const date = now.toLocaleDateString("fr-BE");
  const time = now.toLocaleTimeString("fr-BE");

  return (
    <header className="header">
      <div className="header__datetime">
        <div className="header__date">
          {date}
        </div>

        <div className="header__time">
          {time}
        </div>
      </div>

      <nav className="header__navigation">
        <NavLink
          to="/intervention-en-cours"
          className={({ isActive }) =>
            `header__link ${
              isActive
                ? "header__link--active"
                : ""
            }`
          }
        >
          Intervention en cours
        </NavLink>

        <NavLink
          to="/liste-du-jour"
          className={({ isActive }) =>
            `header__link ${
              isActive
                ? "header__link--active"
                : ""
            }`
          }
        >
          Liste du jour
        </NavLink>

        <NavLink
          to="/historique"
          className={({ isActive }) =>
            `header__link ${
              isActive
                ? "header__link--active"
                : ""
            }`
          }
        >
          Historique
        </NavLink>

        <NavLink
          to="/statistiques"
          className={({ isActive }) =>
            `header__link ${
              isActive
                ? "header__link--active"
                : ""
            }`
          }
        >
          Statistiques
        </NavLink>

        <NavLink
          to="/modeles"
          className={({ isActive }) =>
            `header__link ${
              isActive
                ? "header__link--active"
                : ""
            }`
          }
        >
          Modèles
        </NavLink>
      </nav>

      <div className="header__right">
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;