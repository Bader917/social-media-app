import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  DropdownItem,
  DropdownTrigger,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { useProfile } from "../ProfileContext/ProfileContext";
import Notifications from "../Notifications/Notifications";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

export default function MyNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userToken, setUserToken } = useContext(AuthContext);
  const navigate = useNavigate();

  function handdleLogout() {
    localStorage.removeItem('userToken');
    setUserToken(null);
    navigate('/login');
  }

  const loggedMenuItems = [
    "Profile",
    "Home",
    "Settings",
    "Log Out",
  ];

  const unLoggedMenuItems = [
    "Register",
    "Login",
  ];

  const { profile, isLoading } = useProfile();

  return (
    <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} maxWidth="2xl" height={60}>

      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="cursor-pointer" />
      </NavbarContent>

      <NavbarBrand className="flex justify-end sm:justify-start">
        <Link to="/" className="font-bold text-inherit">Bader Book</Link>
      </NavbarBrand>

      <NavbarContent as="div" justify="end" className="hidden sm:flex">
        <NavbarContent className="hidden sm:flex gap-4" justify="center">

          {
            userToken && <Notifications />
          }

          {
            userToken &&
            <NavbarItem>
              <Link color="foreground" to="/">
                Home
              </Link>
            </NavbarItem>
          }

          {
            !userToken && <>
              <NavbarItem>
                <Link aria-current="page" color="secondary" to="/register">
                  Register
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link color="foreground" to="/login">
                  Login
                </Link>
              </NavbarItem>
            </>
          }
        </NavbarContent>


        {userToken &&
          <div className="sm:hidden block">
            <Notifications />
          </div>
        }

        {
          userToken &&
          <Dropdown placement="bottom-end" className="rounded-sm">
            <DropdownTrigger className="cursor-pointer">

              {
                isLoading ?
                  <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                  :
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="secondary"
                    name="Jason Hughes"
                    size="sm"
                    src={profile?.photo || "/images/avatar-placeholder.png"}
                  />
              }

            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="solid">
              <DropdownItem key="profile" className="rounded-sm">
                <Link className="w-full block font-semibold" to={'/profile'}>Profile</Link>
              </DropdownItem>
              <DropdownItem key="settings" className="rounded-sm">
                <Link className="w-full block font-semibold" to={'/settings'}>Settings</Link>
              </DropdownItem>
              <DropdownItem key="logout" className="rounded-sm" color="danger" onClick={() => handdleLogout()}>
                <Link className="w-full block font-semibold" to={'/logout'}>Log Out</Link>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        }
      </NavbarContent>

      <NavbarMenu className="z-50">
        {userToken ? loggedMenuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className={`w-full block transition-colors
                ${item === "Log Out"
                  ? "hover:text-red-500"
                  : "hover:text-secondary"
                }
              `}
              color={
                index === 2 ? "warning" : index === loggedMenuItems.length - 1 ? "danger" : "foreground"
              }

              onClick={() => {
                setIsMenuOpen(false);
                if (item === "Log Out") {
                  handdleLogout();
                }
              }}

              to={`/${item === 'Log Out' ? 'login' : item}`}
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))
          :
          unLoggedMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full block"
                color={
                  index === 2 ? "warning" : index === unLoggedMenuItems.length - 1 ? "danger" : "foreground"
                }
                to={`/${item}`}
                size="lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            </NavbarMenuItem>
          ))
        }
      </NavbarMenu>
    </Navbar>
  );
}