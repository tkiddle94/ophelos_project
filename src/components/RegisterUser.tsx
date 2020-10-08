import React from 'react';
import { IonInput, IonButton, IonPage, IonLabel, IonAlert, IonContent, IonTitle, IonToolbar, IonThumbnail, IonIcon, IonHeader, IonDatetime } from '@ionic/react';
import './RegisterUser.css';
import { registerUser, writeToCollection } from '../firebaseConfig'
import { close } from 'ionicons/icons';

interface IRegisterUserProps {
    onUserRegistered: any;
    close: any;
}

export class RegisterUser extends React.Component<IRegisterUserProps> {

    private emailValidity: boolean;
    private password: string;
    private repeatedPassword: string;
    private userInfo: { name: string, email: string, phone: number, address: string, dob: string };
    private warningMessage: string = '';
    private registerButton: HTMLIonButtonElement;

    get isValid(): boolean {
        let formValidity: boolean = this.password?.length > 5 && this.repeatedPassword === this.password && this.emailValidity;
        formValidity = formValidity && this.userInfo.address?.length > 0 && this.userInfo.dob?.length > 0 && this.userInfo.phone > 0 && this.userInfo.name?.length > 0;
        return formValidity;
    }

    onEmailChanged(newEmail: string) {
        this.userInfo.email = newEmail;
        if (newEmail && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail)) {
            this.emailValidity = true;
        } else {
            this.emailValidity = false
        }
        this.validitateRegisterButton();
    }

    onPasswordChanged(newPassword: string, repeat: boolean) {
        if (repeat) {
            this.repeatedPassword = newPassword;
        } else {
            this.password = newPassword
        }
        this.validitateRegisterButton();
    }

    onAttributeChanged(value: string, attr: string) {
        if (attr === 'email') {
            if (value && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                this.emailValidity = true;
            } else {
                this.emailValidity = false
            }
        }
        this.userInfo = { ...this.userInfo, [attr]: value };
        this.validitateRegisterButton();
    }


    validitateRegisterButton() {
        let isDisabled = !this.isValid;
        this.registerButton.color = isDisabled ? 'secondary' : 'primary';
        this.registerButton.disabled = isDisabled;
    }

    onRegister() {
        registerUser(this.userInfo.email, this.password).then((ret) => {
            if ((ret as firebase.auth.UserCredential).user) {
                let userDetails: firebase.auth.UserCredential = (ret as firebase.auth.UserCredential);
                let uid = userDetails.user?.uid;
                writeToCollection('users', uid!, { userName: this.userInfo.name, dob: this.userInfo.dob, phone: this.userInfo.phone, address: this.userInfo.address }).then((userNameRet) => {
                    if (userNameRet === undefined) {
                        this.props.onUserRegistered();
                    }
                });
            } else {
                this.warningMessage = ret as string;
                this.forceUpdate();
            }
        })
    }


    render() {
        return <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonThumbnail class="centered" slot="start" onClick={() => this.props.close()}>
                        <IonIcon size="large" icon={close} />
                    </IonThumbnail>
                    <IonTitle>Register</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="register-form">
                    <div className="padding-container">
                        <IonLabel>Name</IonLabel>

                        <IonInput placeholder="Enter here..." type="text" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'name')} />
                    </div>
                    <div className="padding-container">
                        <IonLabel>Email</IonLabel>

                        <IonInput placeholder="Enter here..." type="email" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'email')} />
                    </div>
                    <div className="padding-container">
                        <IonLabel>Password</IonLabel>
                        <IonInput placeholder="Enter here..." type="password" onIonChange={(ev) => this.onPasswordChanged(ev.detail.value as string, false)} />
                    </div>
                    <div className="padding-container">
                        <IonLabel>Repeat password</IonLabel>
                        <IonInput placeholder="Enter here.." type="password" onIonChange={(ev) => this.onPasswordChanged(ev.detail.value as string, true)} />
                    </div>
                    <div className="padding-container">
                        <IonLabel>Phone number</IonLabel>

                        <IonInput placeholder="Enter here..." type="tel" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'phone')} />
                    </div>
                    <div className="padding-container">
                        <IonLabel>Address</IonLabel>
                        <IonInput placeholder="Enter here..." type="text" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'address')} />
                    </div>
                    <div className="padding-container">
                        <IonLabel>Date of Birth</IonLabel>
                        <IonDatetime placeholder={'01 Jan 2000'} displayFormat={"DD MMM YYYY"} onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'dob')}/>
                    </div>

                    <div className="padding-container">
                        <IonButton expand="full" shape="round" onClick={() => this.onRegister()} disabled={true} color="secondary" ref={(el) => this.registerButton = el as HTMLIonButtonElement}>
                            Register
            </IonButton>
                    </div>
                </div>
            </IonContent>
            <IonAlert
                isOpen={this.warningMessage?.length > 0}
                onDidDismiss={() => this.warningMessage = ''}
                header={'Error'}
                message={this.warningMessage}
                buttons={['Okay']}
            />
        </IonPage>;
    }
}
