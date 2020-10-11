import React from 'react';
import { IonInput, IonButton, IonPage, IonLabel, IonAlert, IonContent, IonTitle, IonToolbar, IonThumbnail, IonIcon, IonHeader, IonDatetime } from '@ionic/react';
import './RegisterUser.css';
import { registerUser, writeToCollection } from '../firebaseConfig'
import { close, checkmarkCircleOutline } from 'ionicons/icons';

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
    private emailIcon: HTMLIonIconElement;
    private nameIcon: HTMLIonIconElement;
    private passwordIcon: HTMLIonIconElement;
    private passwordRepeatIcon: HTMLIonIconElement;
    private phoneIcon: HTMLIonIconElement;
    private addressIcon: HTMLIonIconElement;
    private dobIcon: HTMLIonIconElement;


    get isValid(): boolean {
        let formValidity: boolean = this.password?.length > 5 && this.repeatedPassword === this.password && this.emailValidity;
        formValidity = formValidity && this.userInfo.address?.length > 0 && this.userInfo.dob?.length > 0 && this.userInfo.phone > 0 && this.userInfo.name?.length > 0;
        return formValidity;
    }

    onEmailChanged(newEmail: string) {
        this.userInfo.email = newEmail;
        if (newEmail && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail)) {
            this.emailValidity = true;
            this.forceUpdate();
        } else {
            this.emailValidity = false
        }
        this.validitateRegisterButton();
    }

    onPasswordChanged(newPassword: string, repeat: boolean) {
        if (repeat) {
            this.repeatedPassword = newPassword;
            this.passwordRepeatIcon.setAttribute('style', `display: ${newPassword?.length > 5 && newPassword === this.password? 'block' : 'none'};`);
            
        } else {
            this.password = newPassword
            this.passwordIcon.setAttribute('style', `display: ${newPassword?.length > 5 ? 'block' : 'none'};`);
        }
        this.validitateRegisterButton();
    }

    onAttributeChanged(value: string, attr: string) {
        if (attr === 'email') {
            if (value && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                this.emailIcon.setAttribute('style', 'display: block;');
                this.emailValidity = true;
            } else {
                this.emailIcon.setAttribute('style', 'display: none;');
                this.emailValidity = false
            }
        } else if (attr === 'name') {
            this.nameIcon.setAttribute('style', `display: ${value ? 'block' : 'none'};`);
        } else if (attr === 'phone') {
            this.phoneIcon.setAttribute('style', `display: ${value ? 'block' : 'none'};`);
        } else if (attr === 'address') {
            this.addressIcon.setAttribute('style', `display: ${value ? 'block' : 'none'};`);
        } else if (attr === 'dob') {
            this.dobIcon.setAttribute('style', `display: ${value ? 'block' : 'none'};`);
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
                        <div className="row">
                            <IonInput placeholder="Enter here..." type="text" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'name')} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.nameIcon = el as HTMLIonIconElement} />
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Email</IonLabel>
                        <div className="row">
                            <IonInput placeholder="Enter here..." type="email" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'email')} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.emailIcon = el as HTMLIonIconElement} />
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Password</IonLabel>
                        <div className="row">
                            <IonInput placeholder="Enter here..." type="password" onIonChange={(ev) => this.onPasswordChanged(ev.detail.value as string, false)} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.passwordIcon = el as HTMLIonIconElement}/>
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Repeat password</IonLabel>
                        <div className="row">
                            <IonInput placeholder="Enter here.." type="password" onIonChange={(ev) => this.onPasswordChanged(ev.detail.value as string, true)} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.passwordRepeatIcon = el as HTMLIonIconElement}/>
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Phone number</IonLabel>

                        <div className="row">
                            <IonInput placeholder="Enter here..." type="tel" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'phone')} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.phoneIcon = el as HTMLIonIconElement}/>
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Address</IonLabel>
                        <div className="row">
                            <IonInput placeholder="Enter here..." type="text" onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'address')} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.addressIcon = el as HTMLIonIconElement}/>
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Date of Birth</IonLabel>
                        <div className="row">
                            <IonDatetime placeholder={'01 Jan 2000'} displayFormat={"DD MMM YYYY"} onIonChange={(ev) => this.onAttributeChanged(ev.detail.value as string, 'dob')} />
                            <IonIcon className="hide" size="large" icon={checkmarkCircleOutline} ref={(el) => this.dobIcon = el as HTMLIonIconElement}/>
                        </div>
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
