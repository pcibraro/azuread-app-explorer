import React, { useState } from 'react';
import { useMsal } from '../msal-context';
import { loginRequest } from '../msal-config';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';

const TopNavbar = (props) => {

  const { isAuthenticated, loginRedirect, logout } = useMsal();

  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">Azure AD - Applications</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            {!isAuthenticated && (<NavItem onClick={() => loginRedirect(loginRequest)}><NavLink href='#'>Sign in</NavLink></NavItem>)}
            {isAuthenticated && (<NavItem onClick={() => logout()}><NavLink href='#'>Sign out</NavLink></NavItem>)}
          </Nav>  
        </Collapse>
      </Navbar>
      
    </div>
  );
}

export default TopNavbar;