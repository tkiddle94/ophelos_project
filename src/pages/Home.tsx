import { IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import React, { useState } from 'react';
import './Home.css';
import { NewEntry } from '../components/NewEntry'

const Home: React.FC = () => {

  const [showModal, setShowModal] = useState(false);

  function onEntryCompleted() {
    // history.push('/homePage');
}

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">First edit</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton expand="full" color="light" onClick={() => setShowModal(true)}>
          Add an entry
                </IonButton>
        <IonModal
          isOpen={showModal}
          swipeToClose={true}
        >
          <NewEntry
            onEntryCompleted={() => onEntryCompleted()}
            close={() => setShowModal(false)}
          />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
