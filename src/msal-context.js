import React, { Component, createContext, useContext } from 'react';
import * as msal from "@azure/msal-browser";

// create the context
export const MsalContext = createContext();
export const useMsal = () => useContext(MsalContext);

// create a provider
export class MsalProvider extends Component {
	state = {
		publicClient: null,
		isLoading: true,
		isAuthenticated: false,
		user: null,
		accessToken: null
	};
	
	config = {
		auth: {
            clientId: process.env.REACT_APP_CLIENT_ID,
        	authority: process.env.REACT_APP_AUTHORITY,
        	redirectUri: process.env.REACT_APP_REDIRECT_URI,
        },
        cache: {
            cacheLocation: "localStorage", // This configures where your cache will be stored
            storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
        }
	};

	componentDidMount() {
		this.initializeMsal();
	}

	// initialize the auth0 library
	initializeMsal = async () => {
		const publicClient = new msal.PublicClientApplication(this.config);
		this.setState({ publicClient });

        const users = publicClient.getAllAccounts();
        const isAuthenticated = (users && users.length > 0);

		if(!isAuthenticated) {
        	var response = await publicClient.handleRedirectPromise(); 
		
			if (response) {
				this.setState({ 
					isLoading: false, 
					user: publicClient.getAllAccounts()[0],
					isAuthenticated : true,
					accessToken: response.accessToken,
					publicClient: publicClient
				});

				return;
			}
		}

		this.setState({ 
			isLoading: false, 
			user: (users && users.length > 0) ? users[0] : null,
			isAuthenticated : isAuthenticated,
			publicClient: publicClient,
			accessToken: null
		});
	};

	getToken = async (apiRequest) => {
		
		const { publicClient } = this.state;

		try {
			const response = await publicClient.acquireTokenSilent(apiRequest);

			this.setState({ 
				accessToken: response.accessToken
			});
		}
		catch (error) {
			const response = await publicClient.acquireTokenPopup(apiRequest);

			this.setState({ 
				accessToken: response.accessToken
			});
		}
	}

	render() {
		const { publicClient, isLoading, isAuthenticated, user, accessToken } = this.state;
		const { children } = this.props;

		const configObject = {
			isLoading,
			isAuthenticated,
			user,
			accessToken,
			acquireTokenPopup: (...p) => publicClient.acquireTokenPopup(...p),
            acquireTokenSilent: (...p) => publicClient.acquireTokenSilent(...p),
            acquireTokenRedirect: (...p) => publicClient.acquireTokenRedirect(...p),
			loginPopup: (...p) => publicClient.loginPopup(...p),
            logout: (...p) => publicClient.logout(...p),
			loginRedirect: (...p) => publicClient.loginRedirect(...p),
			getToken: (...p) => this.getToken(...p)
		};

		return <MsalContext.Provider value={configObject}>{children}</MsalContext.Provider>;
	}
}