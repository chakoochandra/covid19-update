import $ from "jquery";
import moment from "moment";

class WidgetClock extends HTMLElement {

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.interval = setInterval(() => this.displayTime(), 1000);
        this.displayTime();
    }

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
        this.render();
    }

    static get observedAttributes() {
        return ["time", "date"];
    }

    displayTime() {
        moment.locale("id");
        this.time = moment().format("LTS");
        this.date = moment().format("LL");
        this.render();
    }

    render() {
        this._shadowRoot.innerHTML = `
        <style>
            .clock {
                background-color: #B66DFF;
                padding: 10px;
                color: white;
                font-family: sans-serif;
                display: flex;
                flex-direction: column;
                margin: 5px 0 5px;
            }            
            .clock .time {
                font-size: 2em;
                margin: 0 auto;
            }            
            .clock .date {
                font-size: 1em;
                margin: 0 auto;
            }
        </style>

        <div class="clock">
            <span class="time">${this.time}</span>
            <span class="date">${this.date}</span>
        </div>
      `;
    }
}

customElements.define("widget-clock", WidgetClock);
