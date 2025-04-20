import { Menu } from '../components/Menu.js';
import { Annotator } from '../components/Annotator.js';

import htm from 'https://esm.sh/htm';
import { h, render } from 'https://esm.sh/preact';

const html = htm.bind(h);

const items = [];//['itemA', 'itemB', 'itemC', 'itemD'];

const color = 'red';
const imageUrl = '/static/imgs/test-image1.jpg';
const classes = {
  Dog: {color: 'yellow'},
  Cat: {color: 'orange'},
  Cow: {color: 'brown'},
  Rabbit: {color: 'green'},
  Goat: {color: 'blue'},
};

export function AnnotationPage({ projectName }) {
  return html`
    <div class="flex flex-col gap-4 w-1/5 border-r border-gray-200 px-4">
      <div class="flex gap-6 py-4">
        <a href="" class="a-c">New Project</a>
        <a href="" class="a-c">Open Project</a>
      </div>

      ${html`
        <${Menu}
          title="IMAGES"
          items=${items}
        />
      `}

      ${html`
        <${Menu}
          title="ANNOTATIONS"
          items=${items}
        />
      `}
    </div>

    <div class="flex flex-col gap-4 px-12 w-4/5">
      <div class="flex">
        <p class="h2-c mr-auto">${projectName}</p>

        <div class="flex gap-12">
          <button class="thin-btn-c">finish</button>

          <div class="flex gap-4">
            <button class="solid-btn-c">prev</button>
            <button class="solid-btn-c">next</button>
          </div>

          <div class="flex gap-4">
            <button class="thin-btn-c">clear</button>
            <button class="solid-btn-c">save</button>
          </div>
        </div>
      </div>

      <div class="flex-grow">
        ${html`
          <${Annotator} imageUrl=${imageUrl} annotationColor=${color} classes=${classes} />
        `}
      </div>
    </div>
  `;
}


render(
  html`<${AnnotationPage}  projectName="wild animals"/>`,
  document.getElementById("main")
);
