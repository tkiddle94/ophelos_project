import React from 'react';
import { IonDatetime, IonInput, IonButton, IonPage, IonLabel, IonAlert, IonContent, IonTitle, IonToolbar, IonThumbnail, IonIcon, IonHeader } from '@ionic/react';
import './NewEntry.css';
import { close, addOutline } from 'ionicons/icons';
import { getUid, writeToCollection } from '../firebaseConfig';
import * as firebase from 'firebase'

interface INewEntryProps {
    onEntryCompleted: any;
    close: any;
}

export class NewEntry extends React.Component<INewEntryProps> {

    private income: Array<{ label: string, value: number }> = [{ label: '', value: 0 }];
    private expenditure: Array<{ label: string, value: number }> = [{ label: '', value: 0 }];
    private saveButton: HTMLIonButtonElement;
    private uid: string;
    private month: string = '';
    private showAlert: boolean = false;

    get isValid(): boolean {
        return this.month?.length > 0 && this.income?.findIndex((item) => item.value === 0 || item.label?.length === 0) === -1 && this.expenditure?.findIndex((item) => item.value === 0 || item.label?.length === 0) === -1;
    }

    componentDidMount() {
        this.loadUserData();
    }

    loadUserData() {
        getUid().then((ret) => {
            if (ret) {
                this.uid = ret;

            }
        });
    }

    saveEntry() {
        let totalIncome = 0;
        let totalExpenditure = 0;
        this.income?.forEach((inc) => totalIncome += inc.value);
        this.expenditure?.forEach((expen) => totalExpenditure += expen.value);
        let data = { [`${this.month}`]: { expenditure: this.expenditure, income: this.income, ieRating: totalExpenditure / totalIncome, disposableIncome: totalIncome - totalExpenditure } };

        writeToCollection('ieStatement', this.uid, data).then((ret) => {
            this.showAlert = true;
            this.forceUpdate();
        });
    }

    closeModal() {
        this.props.onEntryCompleted();
    }


    onItemChanged(type: string, index: number, attr: string, value: string) {
        if (type === 'income') {
            if (attr === 'label') {
                this.income[index].label = value;
            } else {
                this.income[index].value = value ? parseInt(value) : 0;
            }
        } else if (type === 'expenditure') {
            if (attr === 'label') {
                this.expenditure[index].label = value;
            } else {
                this.expenditure[index].value = value ? parseInt(value) : 0;
            }
        }
        this.validateSaveButton();
    }

    addNewEntry(attr: string) {
        if (attr === 'income') {
            this.income.push({ label: '', value: 0 });
        } else if (attr === 'expenditure') {
            this.expenditure.push({ label: '', value: 0 });
        }
        this.forceUpdate();
    }


    validateSaveButton() {
        let isDisabled = !this.isValid;
        this.saveButton.color = isDisabled ? 'secondary' : 'primary';
        this.saveButton.disabled = isDisabled;
    }

    render() {
        return <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonThumbnail class="centered" slot="start" onClick={() => this.props.close()}>
                        <IonIcon size="large" icon={close} />
                    </IonThumbnail>
                    <IonTitle>Month Entry</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="entry-form">
                    <div className="padding-container">
                        <IonLabel>Month</IonLabel>
                        <IonDatetime placeholder={'Jan 2000'} displayFormat={"MMM YYYY"} onIonChange={(ev) => {
                            this.month = ev.detail.value?.slice(0, 7) as string;
                            this.validateSaveButton();
                        }} />

                    </div>
                    <div className="padding-container">
                        <IonLabel>Income</IonLabel>
                        {this.income.map((_item, index) => {
                            return <div className="row-container">
                                <IonInput placeholder="Label e.g Salary" type="text" onIonChange={(ev) => this.onItemChanged('income', index, 'label', ev.detail.value as string)} />
                                <div className="text">£</div>
                                <IonInput placeholder="Amount" type="number" onIonChange={(ev) => this.onItemChanged('income', index, 'value', ev.detail.value as string)} />
                            </div>
                        })}

                        <div className="button-container">
                            <IonButton shape="round" color="primary" onClick={() => this.addNewEntry('income')}>
                                <IonIcon size="large" icon={addOutline} />
                            </IonButton>
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonLabel>Expenditure</IonLabel>
                        {this.expenditure.map((_item, index) => {
                            return <div className="row-container">
                                <IonInput placeholder="Label e.g Mortgage" type="text" onIonChange={(ev) => this.onItemChanged('expenditure', index, 'label', ev.detail.value as string)} />
                                <div className="text">£</div>
                                <IonInput placeholder="Amount" type="number" onIonChange={(ev) => this.onItemChanged('expenditure', index, 'value', ev.detail.value as string)} />
                            </div>
                        })}
                        <div className="button-container">
                            <IonButton shape="round" color="primary" onClick={() => this.addNewEntry('expenditure')}>
                                <IonIcon size="large" icon={addOutline} />
                            </IonButton>
                        </div>
                    </div>
                    <div className="padding-container">
                        <IonButton onClick={() => this.saveEntry()} expand="full" shape="round" disabled={true} color="secondary" ref={(el) => this.saveButton = el as HTMLIonButtonElement}>
                            Save
            </IonButton>
                    </div>
                </div>
            </IonContent>
            <IonAlert
                isOpen={this.showAlert}
                onDidDismiss={() => this.closeModal()}
                header={'Success'}
                message={'Your entry has been saved'}
                buttons={['Okay']}
            />
        </IonPage>;
    }
}
