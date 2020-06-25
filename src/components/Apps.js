import React, { useState, useEffect } from 'react';
import { useMsal } from "../msal-context";
import { apiRequest } from "../msal-config";
import { getApps, getAppsNext } from "../services/GraphService";
import { Link } from "react-router-dom";
  
import {
    Form,
    Row,
    FormGroup,
    Col,
    Input,
    Label,
    Button,
    Container,
    Table
} from 'reactstrap';

const Apps = (props) => {
    const top = 20;

    const { isAuthenticated, getToken, accessToken } = useMsal();
    const [name, setName] = useState("");
    const [nameSearch, setNameSearch] = useState("");
    const [apps, setApps] = useState([]);
    const [appsNextLink, setAppsNextLink] = useState([]);

    useEffect(() => {
        async function fetchApps() {
            if (isAuthenticated && accessToken) {
                const newApps = await getApps(accessToken, top, nameSearch);

                setApps(newApps.apps);
                setAppsNextLink(newApps.nextLink);
            }
        }
        fetchApps();
    }, [isAuthenticated, accessToken, nameSearch]);

    useEffect(() => {
        if(isAuthenticated && !accessToken) {
            getToken(apiRequest);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <div></div>;
    }

    const handleSearch = async (evt) => {
        
        evt.preventDefault();

        setNameSearch(name);
    }

    const handleOrderByName = (evt) => {
        evt.preventDefault();

        const sortedApps = [ ...apps];

        setApps(sortedApps.sort((a, b) => a.displayName.localeCompare(b.displayName)));
    };

    const getMoreApps = async (evt) => {
        evt.preventDefault();

        const newApps = await getAppsNext(accessToken, appsNextLink);

        setAppsNextLink(newApps.nextLink);
        setApps(apps.concat(newApps.apps));
    }

    const appRows = apps.map((app) => {
        return (<tr key={app.appId}>
            <td><Link to={`/apps/${app.id}`}>{app.appId}</Link></td>
            <td>{app.displayName}</td>
            <td>{(app.optionalClaims && app.optionalClaims.saml2Token) ? "SAML" : "OAuth"}</td>
        </tr>)
    })

    return (
        <Container style={{ marginTop: 20 }}>
            <Row>
                <Col>
                    <Form>
                        <Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="name">Application Name</Label>
                                    <Input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)} />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Button type="button" onClick={handleSearch} variant="primary" size="lg" block>Search</Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col>
                <Table size="sm" style={{ marginTop: 50 }}>
                    <thead>
                        <tr>
                            <th>Application ID</th>
                            <th><Button variant="primary" onClick={handleOrderByName}>Name</Button></th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appRows}
                    </tbody>
                </Table>
                </Col>
            </Row>
            <Row>
                <Col><Button variant="primary" type="button" size="lg" block onClick={getMoreApps} disabled={!appsNextLink}>More</Button></Col>
     
            </Row>
        </Container>
    );
}

export default Apps;