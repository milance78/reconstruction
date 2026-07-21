import * as React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../redux/store";
import ProfileMenu from "../profileMenu/ProfileMenu";
import "./Header.scss";
const Header = () => {
  const interventions = useAppSelector((state) => state.interventionsList);
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const completedCount = interventions.filter(
    (intervention) => intervention.status === "completed",
  ).length;
  const onHoldCount = interventions.filter(
    (intervention) => intervention.status === "on hold",
  ).length;
  const transferredCount = interventions.filter(
    (intervention) => intervention.status === "transferred",
  ).length;
  const date = now.toLocaleDateString("fr-BE");
  const time = now.toLocaleTimeString("fr-BE");
  return (
    <header className="header">
      <div className="header__datetime">
        <div className="header__date">{date}</div>
        <div className="header__time">{time}</div>
      </div>
      <nav className="header__navigation">
        <NavLink
          to="/intervention-en-cours"
          className={({ isActive }) =>
            `header__link ${isActive ? "header__link--active" : ""}`
          }
        >
          {"Intervention en cours"}
        </NavLink>
        <NavLink
          to="/liste-du-jour"
          className={({ isActive }) =>
            `header__link ${isActive ? "header__link--active" : ""}`
          }
        >
          {"Liste du jour"}
        </NavLink>
        <NavLink
          to="/historique"
          className={({ isActive }) =>
            `header__link ${isActive ? "header__link--active" : ""}`
          }
        >
          {"Historique"}
        </NavLink>
        <NavLink
          to="/statistiques"
          className={({ isActive }) =>
            `header__link ${isActive ? "header__link--active" : ""}`
          }
        >
          {"Statistiques"}
        </NavLink>
        <NavLink
          to="/modeles"
          className={({ isActive }) =>
            `header__link ${isActive ? "header__link--active" : ""}`
          }
        >
          {"Mod\xE8les"}
        </NavLink>
      </nav>
      <div className="header__right">
        <div className="header__stats">
          <div className="header__counter header__counter--completed">
            {"Termin\xE9"} <strong>{completedCount}</strong>
          </div>
          <div className="header__counter header__counter--on-hold">
            {"En attente"} <strong>{onHoldCount}</strong>
          </div>
          <div className="header__counter header__counter--transferred">
            {"Transmis"} <strong>{transferredCount}</strong>
          </div>
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
};
export default Header;
