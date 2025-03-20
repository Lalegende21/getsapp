import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-add-buttton',
    imports: [],
    template: `<button class="add">
      <span>+</span><span class="new">{{ buttonText }}</span>
    </button>`,
    styles: ` 
  @import "../../../styles.scss";
  .add {
    height: 6rem;
    width: 6rem;
    background-color: $secondary;
    color: $white;
    border: none;
    border-radius: 100%;
    box-shadow: 0 0.2rem 0.4rem #ccc;
    font-size: 5rem;
    position: fixed;
    bottom: 5%;
    right: 2%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
      background-color: rgb(214, 189, 78);
    }

    &:hover .new {
      display: block;
    }

    .new {
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(-110%, 50%);
      padding: 1rem .5rem;
      border: none;
      border-radius: .4rem;
      background-color: $secondary;
      color: $black;
      font-weight: 600;
      font-size: 1.2rem;
      white-space: nowrap;
      display: none;
    }
  }
  `
})
export class AddButttonComponent {
  @Input() buttonText: string = 'Texte';
}
