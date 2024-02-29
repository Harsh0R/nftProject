import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import Web3Setup from "../web3setUp/web3setUp";

const Navbar = () => {
  const menuItems = [
    { menu: "Home", link: "/" },
    { menu: "About", link: "/" },
    { menu: "My Account", link: "/myAccount" },
    { menu: "Settings", link: "/" },
    { menu: "FAQs", link: "/" },
    { menu: "Terms of Use", link: "/" },
  ];

  const [active, setActive] = useState(1);

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbarList}>
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`${styles.navbarItem} ${active === index + 1 ? styles.activeItem : ""
              }`}
          >
            <Link
              to={item.link}
              className={styles.navbarLink}
              onClick={() => setActive(index + 1)}
            >
              {item.menu}
            </Link>
          </li>
        ))}
        <Web3Setup></Web3Setup>
      </ul>
    </nav>
  );
};

export default Navbar;
