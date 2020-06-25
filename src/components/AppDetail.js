import React, { useState, useEffect } from 'react';
import { useMsal } from "../msal-context";
import { apiRequest } from "../msal-config";
import { getAppWithPermissions, getAppByAppId, getServicePrincipal } from "../services/GraphService";

import {
    Form,
    Row,
    FormGroup,
    Col,
    Input,
    Label,
    Button,
    Container
} from 'reactstrap';

const AppDetail = (props) => {

    const { isAuthenticated, getToken, accessToken } = useMsal();
    const [appId, setAppId] = useState(props.match.params.id);
    const [appDetails, setAppDetails] = useState();

    useEffect(() => {
        if (isAuthenticated && !accessToken) {
            getToken(apiRequest);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        async function fetchApp() {
            if (isAuthenticated && accessToken && appId) {
                
                setAppDetails(await getAppWithPermissions(accessToken, appId));
                //setSp(await getServicePrincipal(accessToken, appId));
            }
        }
        fetchApp();
    }, [isAuthenticated, accessToken, appId]);
    
    if (!appDetails) return <div>loading...</div>

    const { app, permissions, sp } = appDetails;

    const identifierUris = app.identifierUris.join("\n");

    const passwordCredentials = app.passwordCredentials.map(p => {
        return (
            <Row form>
                <Col md={12}>
                    <FormGroup>
                        <Label for="password">Client Secret - {p.displayName}</Label>
                        <Input type="text" name="password" id="password" value={p.endDateTime} readOnly />
                    </FormGroup>
                </Col>
            </Row>
        )
    })
    
    const tags = app.tags.join("\n");

    const permissionsList = permissions.map(api => {
        
        return api.map(p => {
            return (
                <Row form>
                        <Col md={12}>
                            <FormGroup>
                                <Input type="text" name="permission" id="permission" value={p} readOnly />
                            </FormGroup>
                        </Col>
                </Row>
                )
        });
    });

    let certificates;
    if(sp) {
        certificates = sp[0].keyCredentials.map(k => {
            const cert = `Thumbprint: ${k.customKeyIdentifier}\nName: ${k.displayName}\nExpiration: ${k.endDateTime}`;
            return (
                <Row form>
                        <Col md={12}>
                            <FormGroup>
                                <Input type="textarea" name="cert" id="cert" rows="3" value={cert} readOnly />
                            </FormGroup>
                        </Col>
                </Row>
            )
        });
    }

    const goBack = (evt) => {
        props.history.push("/apps");
    }

    return (
        <Container style={{ marginTop: 20 }}>
            <Row>
                <Col>
                    <Form>
                        <Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="appId">Application Id</Label>
                                    <Input type="text" name="appId" id="appId" value={app.appId} readOnly />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="displayName">Display Name</Label>
                                    <Input type="text" name="displayName" id="displayName" value={app.displayName} readOnly />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="identifierUris">Identifier URIs</Label>
                                    <Input type="textarea" name="identifierURIs" id="identifierURIs" value={identifierUris} readOnly />
                                </FormGroup>
                            </Col>
                        </Row>
                        {passwordCredentials}
                        <Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="tags">Tags</Label>
                                    <Input type="textarea" name="tags" id="tags" value={tags} readOnly />
                                </FormGroup>
                            </Col>
                        </Row>

                        {permissionsList && (<Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="requiredApis">Required APIs</Label>
                                </FormGroup>
                            </Col>
                        </Row>)}
                        
                        {permissionsList}
                        
                        {certificates && (<Row form>
                            <Col md={12}>
                                <FormGroup>
                                    <Label for="certs">Certificates</Label>
                                </FormGroup>
                            </Col>
                        </Row>)}
                        
                        {certificates}
                    </Form>
                </Col>

            </Row>
            <Row>
                <Col>
                    <Button type="button" onClick={goBack}>Back</Button>
                </Col>
            </Row>
        </Container>
    )
}

export default AppDetail;