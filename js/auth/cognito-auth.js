import {
    COGNITO_USER_POOL_ID,
    COGNITO_APP_CLIENT_ID
} from 'APP_CONFIG';
import {
    AuthenticationDetails,
    CognitoUserPool,
    CognitoUser,
    CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import decodeJWT from 'jwt-decode';


const poolData = {
    UserPoolId: COGNITO_USER_POOL_ID,
    ClientId: COGNITO_APP_CLIENT_ID
};

export default class CognitoAuth {

    getUserPool(poolData) {
        return new CognitoUserPool(poolData);
    }

    registerUserInCogntioPool(username, phoneNo, password) {
        const userPool = this.getUserPool(poolData);
        return new Promise((resolve, reject) => {

            const dataPhoneNo = {
                Name: "phone_number",
                Value: phoneNo
            }

            const attributePhone = new CognitoUserAttribute(dataPhoneNo);
            var attributeList = [];
            attributeList.push(attributePhone);

            userPool.signUp(username, password, attributeList, null, function(err, result) {
                if (err) {
                    return reject(err);
                } else {
                    const cognitoUser = result.user;
                    return resolve(cognitoUser);
                }

            });
        })
    }

    authenticateUserAgainstUserPool(username, password, newPassword) {
        const userPool = this.getUserPool(poolData);
        return new Promise((resolve, reject) => {
            const authenticationData = {
                Username: username,
                Password: password
            };
            const authenticationDetails = new AuthenticationDetails(authenticationData);
            const userData = {
                Username: authenticationData.Username,
                Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function(result) {
                  return cognitoUser.getUserAttributes(function(err) {
                    if (err) {
                        return reject(err);
                    }
                    const decode = decodeJWT(cognitoUser.signInUserSession.idToken.jwtToken);
                    sessionStorage.setItem("user_id", decode.sub);
                    const user = {
                        username: cognitoUser.getUsername()
                    };
                    for (let i = 0; i < result.length; i++) {
                        user[result[i].getName()] = result[i].getValue();
                    }
                    return resolve(user);
                  });

                },
                onFailure: function(err) {
                    return reject(err);
                },
                newPasswordRequired: function(userAttributes) {
                  if(newPassword){
                    delete userAttributes.email_verified;
                    delete userAttributes.phone_number_verified;
                    cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
                  }else{
                    return reject({
                      newPassword: true
                    })
                  }

                }
            });

        });
    }

    confirmUser(confirmationCode, username) {
        const userPool = this.getUserPool(poolData);
        return new Promise((resolve, reject) => {
            const userData = {
                Username: username,
                Pool: userPool
            };
            const cognitoUser = new CognitoUser(userData);
            cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        })


    }

    getCurrentUserInCognitoPool() {
        const userPool = this.getUserPool(poolData);
        const cognitoUser = userPool.getCurrentUser();
        return cognitoUser;
    }

    changeUserPasswordInUserPool(oldPassword, newPassword) {
        const cognitoUser = this.getCurrentUserInCognitoPool();
        cognitoUser.changePassword(oldPassword, newPassword, function(err) {
            if (err) {
                return;
            }
        })
    }

    getTokenForAPIAuth() {
        const user = this.getCurrentUserInCognitoPool();
        if (user !== null) {
            return user.getSession(function(error, session) {
                if (error) {
                    return;
                }
                return session.idToken.jwtToken;
            })
        }

    }

    getIdTokenForAPIAuth(){
      const user = this.getCurrentUserInCognitoPool();
      if (user !== null) {
          return user.getSession(function(error, session) {
              if (error) {
                  return;
              }
              return session.idToken;
          })
      }
    }

    isLoggedIn() {
        const user = this.getCurrentUserInCognitoPool();

        if (user !== null) {
            return user.getSession(function(error, session) {
                if (error) {
                    return;
                }
                return session.isValid();
            });
        }
        return false;
    }

    logoutUserAgainstUserPool() {
        const user = this.getCurrentUserInCognitoPool();

        if (user !== null) {
            user.signOut();
        }
    }

}
