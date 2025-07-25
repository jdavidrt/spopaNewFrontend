// fe/src/components/NavBar.js
import React, { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/SPOPALogo.png";
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useAuth0 } from "@auth0/auth0-react";
import { useSession } from "../utils/sessionManager";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const { userType, needsRegistration, destroySession, hasRole } = useSession();

  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = async () => {
    try {
      // Clear local session data
      await destroySession();
      console.log('Local session cleared');
    } catch (error) {
      console.error('Local session cleanup error:', error);
    }

    // Logout from Auth0
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      }
    });
  };

  // Navigation items configuration
  const navigationItems = {
    student: [
      {
        path: "/studentoffers",
        label: "Student Offers",
        icon: "briefcase"
      },
      {
        path: "/professors",
        label: "Professors",
        icon: "chalkboard-teacher"
      },
      {
        path: "/mychecklist",
        label: "My Checklist",
        icon: "tasks"
      },
      {
        path: "/process",
        label: "My Process",
        icon: "route"
      }
    ],
    admin: [
      {
        path: "/admin",
        label: "Admin Dashboard",
        icon: "tachometer-alt"
      }
    ],
    company: [
      {
        path: "/business",
        label: "Business Portal",
        icon: "building"
      }
    ]
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (hasRole("Estudiante")) return navigationItems.student;
    if (hasRole("Administrativo")) return navigationItems.admin;
    if (hasRole("Empresa")) return navigationItems.company;
    return [];
  };

  // Use Auth0 authentication state and check if registration is complete
  const isFullyAuthenticated = isAuthenticated && !needsRegistration;
  const showRegistrationWarning = isAuthenticated && needsRegistration;

  const getRoleInfo = () => {
    const roleMap = {
      "Estudiante": { label: "Student", icon: "graduation-cap", color: "primary" },
      "Administrativo": { label: "Administrator", icon: "user-shield", color: "success" },
      "Empresa": { label: "Company", icon: "building", color: "info" }
    };
    return roleMap[userType] || null;
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="nav-container">
      <Navbar color="light" light expand="md" container={false}>
        <Container>
          <RouterNavLink to="/" className="navbar-brand d-flex align-items-center">
            <img
              className="app-logo me-2"
              src={logo}
              alt="SPOPA logo"
              width="60"
            />
            <span className="fw-bold text-primary">SPOPA</span>
          </RouterNavLink>

          <NavbarToggler onClick={toggle} />

          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                >
                  <FontAwesomeIcon icon="home" className="me-1" />
                  Home
                </NavLink>
              </NavItem>

              {/* Show registration warning if user needs to complete registration */}
              {showRegistrationWarning && (
                <NavItem>
                  <NavLink disabled className="text-warning">
                    <FontAwesomeIcon icon="exclamation-triangle" className="me-1" />
                    Complete registration to continue
                  </NavLink>
                </NavItem>
              )}

              {/* Dynamic navigation based on user role */}
              {isFullyAuthenticated && getNavigationItems().map((item) => (
                <NavItem key={item.path}>
                  <NavLink
                    tag={RouterNavLink}
                    to={item.path}
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    <FontAwesomeIcon icon={item.icon} className="me-1" />
                    {item.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            {/* Desktop Navigation */}
            <Nav className="d-none d-md-block" navbar>
              {!isAuthenticated && (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    className="btn-margin"
                    onClick={() => loginWithRedirect()}
                  >
                    <FontAwesomeIcon icon="sign-in-alt" className="me-2" />
                    Log in
                  </Button>
                </NavItem>
              )}

              {isAuthenticated && user && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle me-2"
                      width="40"
                      height="40"
                    />
                    <span className="d-none d-lg-inline">
                      {user.name}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>
                      <div>
                        <strong>{user.name}</strong>
                        <br />
                        <small className="text-muted">{user.email}</small>

                        {roleInfo && (
                          <div className="mt-2">
                            <span className={`badge bg-${roleInfo.color}`}>
                              <FontAwesomeIcon icon={roleInfo.icon} className="me-1" />
                              {roleInfo.label}
                            </span>
                          </div>
                        )}

                        {showRegistrationWarning && (
                          <div className="mt-2">
                            <span className="badge bg-warning">
                              <FontAwesomeIcon icon="exclamation-triangle" className="me-1" />
                              Registration Required
                            </span>
                          </div>
                        )}
                      </div>
                    </DropdownItem>
                    <DropdownItem divider />

                    {/* Only show profile link if fully authenticated */}
                    {isFullyAuthenticated && (
                      <>
                        <DropdownItem
                          tag={RouterNavLink}
                          to="/profile"
                          className="dropdown-profile"
                          activeClassName="router-link-exact-active"
                        >
                          <FontAwesomeIcon icon="user" className="me-2" />
                          Profile
                        </DropdownItem>
                        <DropdownItem divider />
                      </>
                    )}

                    {/* Show registration hint if needed */}
                    {showRegistrationWarning && (
                      <>
                        <DropdownItem
                          tag={RouterNavLink}
                          to="/"
                          className="text-warning"
                        >
                          <FontAwesomeIcon icon="home" className="me-2" />
                          Complete Registration
                        </DropdownItem>
                        <DropdownItem divider />
                      </>
                    )}

                    {/* Quick role switching (development feature) */}
                    {process.env.NODE_ENV === 'development' && isFullyAuthenticated && (
                      <>
                        <DropdownItem header>
                          <small className="text-muted">Quick Role Switch (Dev)</small>
                        </DropdownItem>
                        <DropdownItem onClick={() => window.location.href = '/profile'}>
                          <FontAwesomeIcon icon="user-cog" className="me-2" />
                          Change Role
                        </DropdownItem>
                        <DropdownItem divider />
                      </>
                    )}

                    <DropdownItem
                      id="qsLogoutBtn"
                      onClick={logoutWithRedirect}
                    >
                      <FontAwesomeIcon icon="power-off" className="me-2" />
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>

            {/* Mobile Navigation */}
            {!isAuthenticated && (
              <Nav className="d-md-none" navbar>
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    block
                    onClick={() => loginWithRedirect()}
                  >
                    <FontAwesomeIcon icon="sign-in-alt" className="me-2" />
                    Log in
                  </Button>
                </NavItem>
              </Nav>
            )}

            {isAuthenticated && user && (
              <Nav
                className="d-md-none justify-content-between"
                navbar
                style={{ minHeight: 170 }}
              >
                <NavItem>
                  <div className="user-info d-flex align-items-center">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle me-3"
                      width="50"
                      height="50"
                    />
                    <div>
                      <h6 className="mb-0">{user.name}</h6>
                      <small className="text-muted">{user.email}</small>

                      {roleInfo && (
                        <div className="mt-1">
                          <span className={`badge bg-${roleInfo.color}`}>
                            <FontAwesomeIcon icon={roleInfo.icon} className="me-1" />
                            {roleInfo.label}
                          </span>
                        </div>
                      )}

                      {showRegistrationWarning && (
                        <div className="mt-1">
                          <span className="badge bg-warning">
                            <FontAwesomeIcon icon="exclamation-triangle" className="me-1" />
                            Registration Required
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </NavItem>

                {/* Show registration hint for mobile if needed */}
                {showRegistrationWarning && (
                  <NavItem>
                    <RouterNavLink
                      to="/"
                      activeClassName="router-link-exact-active"
                      className="d-flex align-items-center text-decoration-none text-warning"
                    >
                      <FontAwesomeIcon icon="home" className="me-2" />
                      Complete Registration
                    </RouterNavLink>
                  </NavItem>
                )}

                {/* Only show profile link if fully authenticated */}
                {isFullyAuthenticated && (
                  <NavItem>
                    <RouterNavLink
                      to="/profile"
                      activeClassName="router-link-exact-active"
                      className="d-flex align-items-center text-decoration-none"
                    >
                      <FontAwesomeIcon icon="user" className="me-2" />
                      Profile
                    </RouterNavLink>
                  </NavItem>
                )}

                <NavItem>
                  <button
                    className="btn btn-link text-decoration-none d-flex align-items-center"
                    id="qsLogoutBtn"
                    onClick={logoutWithRedirect}
                  >
                    <FontAwesomeIcon icon="power-off" className="me-2" />
                    Logout
                  </button>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;