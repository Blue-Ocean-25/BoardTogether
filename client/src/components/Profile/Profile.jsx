import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useVerifyLogin from '../utils/useVerifyLogin.jsx';
import { format } from 'date-fns';
import transformBuffer from '../utils/TransformBuffer.jsx';

const Profile = ({ friends, setFriends }) => {
  const [user, setUser] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [edit, setEdit] = useState(false);
  const [profilePicBlob, setProfilePicBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useVerifyLogin(true);

  useEffect(() => {
    setIsLoading(true);
    if (email.length > 0) {
      Promise.all([
        axios.get(`/api/profile/${email}`),
        axios.get(`/api/gameHistory/${email}`)
      ])
        .then(([profile, history]) => {
          setGameHistory(history.data);
          setUser(profile.data[0]);
          setFriends(profile.data[0].friends);
          let url = profile.data[0].profilePic.data ? transformBuffer(profile.data[0].profilePic.data.data, profile.data[0].profilePic.contentType) : 'https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png';
          setProfilePicBlob(url);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [email]);


  const handleDelete = async (friendName) => {
    try {
      await axios.put('/api/profile/deleteFriend', { email, friendName });
      setFriends((prev) => prev.filter((friend) => friend !== friendName));
    } catch (err) {
      console.error(err);
    }
  };


  const editView = (
    <div className="mt-2">
      <form>
        <label htmlFor="profile-pic" className="floating-label">Upload File</label>
        <input id="profile-pic" type="file" accept="image/*" className="file-input" onChange={(e) => {
          handleFileUpload(e.target.files[0]);
        }} />
        <p className="mt-2">
          <button type="submit" className="btn btn-sm w-40">Save Changes</button>
        </p>
      </form>
    </div>
  );

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const blob = new Blob([arrayBuffer], { type: file.type });

      const formData = new FormData();
      formData.append('imageBlob', blob, file.name);

      axios.put(`/api/profile/${user._id}/profilePicture`, formData)
        .then(response => {
          let url = transformBuffer(arrayBuffer, file.type)
          setProfilePicBlob(url);
        })
        .catch(error => {
          console.error(error);
        });
    }
    reader.readAsArrayBuffer(file);
    setEdit(false);
  }

  if (user.length === 0 || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-300">
        <h1 className="text-6xl font-bold mb-25">Loading...</h1>
      </div>
    )
  }

  return (
    <div id="profile" className="flex flex-col justify-items-center content-center mt-30">
      <img
        src="https://cdn-icons-png.flaticon.com/512/3578/3578801.png"
        alt="Dice"
        className="fixed left-[-100px] bottom-[-100px] w-100 h-100 transform rotate-45 opacity-30 mix-blend-multiply z-10"
      />
      <div id="profile-header" className="profile text-center">
        {profilePicBlob ? <img src={profilePicBlob} data-testid="profile-pic-uploaded" alt="profile-pic" className="w-50 h-50 mx-auto rounded-full" /> : <img src='https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png' data-testid = "profile-pic-not-uploaded" alt="profile-pic" className="w-50 h-50 mx-auto rounded-full" />}
        {edit ? editView : <button data-testid="edit-profile" className="btn btn-sm mt-2" onClick={() => setEdit(true)}>Edit Profile</button>}
        <h1 className="text-3xl">Welcome, {user.username}!</h1>
      </div>
      <div id="profile-details" className="text-center mt-4">
        <h1 className="text-2xl">Profile Details</h1>
        <p className="text-lg">Email: {user.email}</p>
        <p className="text-lg">Games Played: {gameHistory.length}</p>
        <p className="text-lg">Game History: {user.gameHistory}</p>
        <div className="flex flex-row flex-wrap gap-2 justify-center">
          {gameHistory?.length ? (
            gameHistory.map((game) => {
              return (
                <div key={game.game} className="bg-base-100 rounded-box shadow-md p-4 border-base-200">
                  <p>Game: {game.game}</p>
                  <p>Game Key: {game.gameKey}</p>
                  <p>Date: {format(game.createdAt, 'MM/dd/yyyy')}</p>
                  <p>Players: {game.players.join(', ')}</p>
                  <p>Winner: {game.winner}</p>
                </div>
              )
            })
          ) : <p className="text-lg font-semibold">No games played</p>}
        </div>
        <div className='divider'></div>

        <h3 className='text-3xl mb-10 font-bold'>Friends List</h3>
        {friends?.length > 0 ? (
          <div className="flex flex-col items-center gap-4 w-screen mx-auto">
            {friends.map((friend, index) => (
              <div key={index} className="card shadow-lg bg-base-100 w-1/2">
                <div className="card-body mx-auto flex flex-row w-full justify-between">
                  <Link to='/profile' className="text-lg font-semibold">{friend}</Link>
                  <button
                    data-testid="delete-friend-button"
                    className='btn btn-error btn-sm'
                    onClick={() => handleDelete(friend)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg font-semibold">No Friends Found</p>
        )}
      </div>
    </div>
  );
};

export default Profile;




