import React, { useState } from 'react';
import { IonSpinner, IonModal, IonContent, IonPage, IonInput, IonButton, IonThumbnail, IonImg, IonToast } from '@ionic/react';
import './Login.css';
import { loginUser, isUserLoggedIn, getUid, getCollection } from '../firebaseConfig';
import { useHistory } from "react-router-dom";
import { RegisterUser } from '../components/RegisterUser';

const Login: React.FC = () => {
    let email: string;
    let emailValidity: boolean = false;
    let password: string;
    let passwordValidity: boolean = false;
    let loginButton: HTMLIonButtonElement;
    let errorMessage: string = 'Wrong email or password please try again.';
    const [showToast, setShowToast] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const history = useHistory();
    // React.useEffect(() => {
    //     isUserLoggedIn().then((ret) => {
    //         if (ret) {
    //             history.push('/homePage');
    //         } else {
    //             setIsLoading(false);
    //         }
    //     });
    //     setTimeout(() => {
            
    //         isUserLoggedIn().then((ret) => {
    //             if (ret) {
    //                 loadUserData();
    //                 history.push('/homePage');
    //             } else {
    //                 setIsLoading(false);
    //             }
    //         });
    //     }, 1000);
    //     setIsLoading(false);
    // }, [])

    // function loadUserData() {
    //     getUid().then((ret) => {
    //         if (ret) {
    //             getCollection('users', ret).then((userData) => {
    //                 if (userData?.darkMode) {
    //                     document.body.classList.add('dark');
    //                     statusBar?.backgroundColorByHexString('#ffffff');
    //                 }
    //             });
    //         }
    //     });
    // }

    function onLogin() {
        loginUser(email as string, password as string).then((ret) => {
            if (ret === 'accepted') {
                history.push('/homePage');
            } else {
                setShowToast(true);
            }
        });
    }

    function onEmailChanged(newEmail: string) {
        email = newEmail;
        if (newEmail && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail)) {
            emailValidity = true;
        } else {
            emailValidity = false
        }
        validateLoginButton();
    }

    function onPasswordChanged(newPassword: string) {
        password = newPassword;
        passwordValidity = newPassword?.length > 5;
        validateLoginButton();
    }

    function validateLoginButton() {
        const isDisabled = !(emailValidity && passwordValidity)
        loginButton.disabled = isDisabled;
        loginButton.color = isDisabled ? 'secondary' : 'primary';

    }

    function newUserRegistered() {
        history.push('/homePage');
    }

    return (
        <IonPage>
            {isLoading && <IonContent>
                <div className="outer-form">
                    <div className="header-container"/>
                    <div className="login-form">
                        <div className="padding-container">
                            <IonInput placeholder="Email" type="email" onIonChange={(ev) => onEmailChanged(ev.detail.value!)} />
                        </div>
                        <div className="padding-container">
                            <IonInput placeholder="Password" type="password" onIonChange={(ev) => onPasswordChanged(ev.detail.value!)} />
                        </div>
                        <div className="padding-container">
                            <IonButton expand="full" shape="round" onClick={() => onLogin()} disabled={true} color="secondary" ref={(el) => loginButton = el as HTMLIonButtonElement}>
                                Login
                            </IonButton>
                        </div>
                    </div>
                    <IonButton expand="full" color="light" onClick={() => setShowModal(true)}>
                        Don't have an account? Register here
                </IonButton>
                </div>
                <IonModal
                    isOpen={showModal}
                    swipeToClose={true}
                >
                    <RegisterUser
                        onUserRegistered={() => newUserRegistered()}
                        close={() => setShowModal(false)}
                    />
                </IonModal>
                <IonToast
                    // ref={(el) => toastElement = el as HTMLIonToastElement}
                    position="top"
                    color="secondary"
                    isOpen={showToast}
                    message={errorMessage}
                    onDidDismiss={() => setShowToast(false)}
                    duration={2000}
                />
            </IonContent>}
            {!isLoading && <IonSpinner name="crescent" />}
        </IonPage>
    );
};

export default Login;
