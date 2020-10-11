import { IonDatetime, IonModal, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonThumbnail } from '@ionic/react';
import React, { useState } from 'react';
import './Home.css';
import { NewEntry } from '../components/NewEntry'
import { getUid, getCollection, logout } from '../firebaseConfig';
import { useHistory } from "react-router-dom";

const Home: React.FC = () => {

  const date = new Date();
  let uid: string;
  const [currentMonth, setCurrentMonth] = useState('');
  const [income, setIncome] = useState([{ label: '', value: 0 }]);
  const [expenditure, setExpenditure] = useState([{ label: '', value: 0 }]);
  const [ieRatingClass, setIeRatingClass] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [disposableIncome, setDisposableIncome] = useState(0);
  const [ieRating, setIeRating] = useState(-1);
  const history = useHistory();

  React.useEffect(() => {
    setCurrentMonth(`${date.getFullYear()}-${date.getMonth() + 1}`);
  }, []);

  React.useEffect(() => {
    updateMonthData();
  }, [currentMonth]);

  function updateMonthData() {
    getUid().then((ret) => {
      if (ret) {
        uid = ret;
        getCollection('ieStatement', uid).then((ret) => {
          if (ret[`${currentMonth}`]) {
            setIncome(ret[`${currentMonth}`].income);
            setExpenditure(ret[`${currentMonth}`].expenditure);
            setDisposableIncome(ret[`${currentMonth}`].disposableIncome);
            const rating = Math.round((ret[`${currentMonth}`].ieRating * 100));
            setIeRating(rating);
            if (rating < 10) {
              setIeRatingClass('A');
            } else if (rating < 30) {
              setIeRatingClass('B');
            } else if (rating < 50) {
              setIeRatingClass('C');
            } else {
              setIeRatingClass('D');
            }
          } else {
            setIncome([{ label: '', value: 0 }]);
            setExpenditure([{ label: '', value: 0 }]);
            setIeRatingClass('');
            setDisposableIncome(0);
            setIeRating(-1);
          }
        });
      }
    });
  }
  function onEntryCompleted() {
    setShowNewEntry(false);
    updateMonthData();
  }

  function logOut() {
    logout().then((ret) => {
      if (ret === true) {
        history.push('/login')
      } else {
        //TODO LOGOUT ERROR;
      }
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{`I&E Statement`}</IonTitle>
          <IonThumbnail slot="end" onClick={() => logOut()}>
            Log out
          </IonThumbnail>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {currentMonth?.length > 0 && <div className="container">
          <div className="title">
            {`Selected Month`}
          </div>
          <div className="sub-title">
            <IonDatetime placeholder={currentMonth} displayFormat={"MMM YYYY"} onIonChange={(ev) => {
              setCurrentMonth(ev.detail.value?.slice(0, 7) as string);
            }} />
          </div>
        </div>}
        {ieRating !== -1 &&
          <div className="container">
            <div className="title">
              {`Selected Month's I&E Rating:`}
            </div>
            <div className={`ie-rating-class ${ieRatingClass}`}>
              {ieRatingClass}
            </div>
            <div className="sub-title">
              {ieRating}%
            </div>
          </div>}
        {ieRating !== -1 &&
          <div className="container">
            <div className="title">
              {`Selected Month's Disposable Income:`}
            </div>
            <div className="sub-title">
              £{disposableIncome}
            </div>
          </div>}
        {income[0]?.label?.length > 0 && <div className="container">
          <div className="title">Income:</div>
          {income?.map((inc) => {
            return <div className="row">
              <div className="label">
                {inc.label}
              </div>
              <div className="value">
                £{inc.value}
              </div>
            </div>
          })}
        </div>
        }
        {expenditure[0]?.label?.length > 0 && <div className="container">
          <div className="title">Expenditure:</div>
          {expenditure?.map((exp) => {
            return <div className="row">
              <div className="label">
                {exp.label}
              </div>
              <div className="value">
                £{exp.value}
              </div>
            </div>
          })}
        </div>}
        {ieRating === -1 && <div className="container">
          <div className="title">
            Looks like you have not added your statement for this month, click below to add...
          </div>
        </div>}
      </IonContent>
      <IonButton expand="full" color="secondary" onClick={() => setShowNewEntry(true)}>
        Add an entry
      </IonButton>

      <IonModal
        isOpen={showNewEntry}
        swipeToClose={true}
      >
        <NewEntry
          onEntryCompleted={() => onEntryCompleted()}
          close={() => setShowNewEntry(false)}
        />
      </IonModal>
    </IonPage>
  );
};

export default Home;
