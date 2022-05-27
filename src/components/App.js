import {useState, useEffect} from 'react';
import api from '../utils/api'; // спасибо, видимо гит не посчитал переименование за изменение, поправил
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
// import InfoTooltip from './InfoTooltip';
import * as auth from '../utils/auth';
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';

function App() {
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const history = useHistory();

  useEffect(() => {
    Promise.all([api.getProfileData(), api.getInitialCards()])
      .then(([user, cardList]) => {
        setCurrentUser(user);
        setCards(cardList);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleUpdateUser = ({name, about}) => {
    api.editProfile(name, about)
      .then((userInfo) => {
        setCurrentUser(userInfo);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateAvatar = ({avatar}) => {
    api.updateAvatar(avatar)
      .then(() => {
        setCurrentUser({...currentUser, avatar});
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  };

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    const likeAction = isLiked
    ? api.deleteCardLike(card._id)
    : api.setCardLike(card._id);

    likeAction
      .then((newCard) => {
        setCards((state) => state.map((c) => (c._id === card._id ? newCard : c)));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCards((items) => items.filter((c) => c._id !== card._id && c));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function handleAddPlaceSubmit({name, link}) {
    api.addCard(name, link)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  };
  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  };
  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  };
  const hadleCardClick = (card) => {
    setSelectedCard(card);
  };
  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
  };

  // Авторизация
  const onRegister = ({password, email}) => {
    auth.register(email, password)
     .then(res => {

        history.push("/sign-in");
     })
     .catch((err) => {
      console.log(err);
    });
  };

  const onLogin = ({password, email}) => {
    auth.authorize(email, password)
      .then(res => {
        localStorage.setItem("jwt", res.token);
        setLoggedIn(true);
        console.log(loggedIn, 'loggenin')
        history.push('/');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSignOut = () => {
    localStorage.removeItem("jwt");
    setLoggedIn(false);
    history.push("/sign-in");
  }


  useEffect(() => {
    const tokenCheck = () => {
      if (localStorage.getItem('jwt')){
        let jwt = localStorage.getItem('jwt');
        auth.getContent(jwt)
        .then((res) => {
          if (res){
            setLoggedIn(true);
            history.push("/");
          }
        })
        .catch((err) => console.error(err));
      }
    }
    tokenCheck();
  }, [history]);



  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__container">
          <Header onSignOut={onSignOut}/>
          <Switch>
            <ProtectedRoute
              onEditAvatarClick={handleEditAvatarClick}
              onEditProfileClick={handleEditProfileClick}
              onAddPlaceClick={handleAddPlaceClick}
              onCardClick={hadleCardClick}
              cards={cards}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
              component={Main}
              loggedIn={loggedIn}
              exact
              path="/"
            />

            <Route path="/sign-in">
              <Login buttonText="Войти" onLogin={onLogin}/>
            </Route>

            <Route path="/sign-up">
              <Register buttonText="Зарегистрироваться" onRegister={onRegister}/>
            </Route>

            <Route>
                {loggedIn ? (
                  <Redirect to="/" />
                ) : (
                  <Redirect to="/sign-up" />
                )}
            </Route>
          </Switch>

         {loggedIn && <Footer />}

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
          />

          <PopupWithForm
            name="confirm"
            title="Вы уверены?"
            buttonText="Да"
          />

          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
