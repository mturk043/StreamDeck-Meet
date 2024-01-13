// Saves options to chrome.storage
const saveOptions = () => {
  const color = document.getElementById('color').value;
  const likesColor = document.getElementById('like').checked;

  const MeetButtonOne = document.getElementById('MeetButtonOne').value;

  chrome.storage.sync.set(
    { favoriteColor: color,
      likesColor: likesColor,
      MeetButtonOne: MeetButtonOne,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { favoriteColor: 'red',
      likesColor: true,
      MeetButtonOne: MeetButtonOne,
     },
    (items) => {
      document.getElementById('color').value = items.favoriteColor;
      document.getElementById('like').checked = items.likesColor;

      document.getElementById('MeetButtonOne').value = items.MeetButtonOne;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
