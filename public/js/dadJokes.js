const ul = document.querySelector('ul');
const button = document.querySelector('button');

button.addEventListener('click', joking)

async function joking() {
  try {
    const joke = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } })
    try {
      const firstLi = document.querySelector('li');
      if (ul.contains(firstLi)) {
        ul.removeChild(firstLi);
      }
    } catch (e) {
      console.log(e);
    }
    const li = document.createElement('li');
    li.append(joke.data.joke)
    ul.append(li)
  } catch (e) {
    console.log('an error', e)
  }
}