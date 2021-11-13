import React, { useState, useEffect } from "react";
import { LoginButton } from "@inrupt/solid-ui-react";
import {
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Container,
} from "@chakra-ui/react";

export function LoginForm({
  defaultIdP = "https://inrupt.net",
  redirectUrl = "http://localhost:3000",
}): React.ReactElement {
  const [idp, setIdp] = useState(defaultIdP);

  return (
    <Container fixed="true">
      <InputGroup>
        <Input
          label="Identity Provider"
          placeholder="Identity Provider"
          type="url"
          value={idp}
          onChange={(e) => setIdp(e.target.value)}
        />
        <InputRightAddon>
          <LoginButton oidcIssuer={idp} redirectUrl={redirectUrl}>
            <Button variant="contained" color="primary">
              Log&nbsp;in
            </Button>
          </LoginButton>
        </InputRightAddon>
      </InputGroup>
    </Container>
  );
}
