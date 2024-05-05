import { timeout } from 'fire/utils';
import highlightCopySvg from './highlightcopy.svg?raw';

export default function highlightCopy() {
	return {
		'after:highlightElement': ({ el, text }) => {
			const btn = document.createElement('button');
			btn.innerHTML = highlightCopySvg;
			btn.classList.add('highlight-js-copy');

			el.parentElement.appendChild(btn);

			btn.addEventListener('click', async () => {
				if (!navigator.clipboard) return;

				await navigator.clipboard.writeText(text.trim());

				const noti = document.createElement('span');
				noti.innerText = 'Copied';
				noti.classList.add('highlight-js-noti');

				el.parentElement.appendChild(noti);

				await timeout(400);

				noti.remove();
			});
		},
	};
}
