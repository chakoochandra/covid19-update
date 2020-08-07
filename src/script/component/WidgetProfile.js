class WidgetProfile extends HTMLElement {

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.src = this.getAttribute("src") || "";
        this.alt = this.getAttribute("alt") || "";
        this.caption = this.getAttribute("caption") || "";
        this.quote = this.getAttribute("quote") || "";
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
        this.render();
    }

    static get observedAttributes() {
        return ["quote", "caption", "src", "alt"];
    }

    render() {
        this._shadowRoot.innerHTML = `
        <style>
            figure {
                text-align: center;
            }
            figcaption {
                font-size: 0.8em;
                font-weight: bold;
            }
            p {
                font-size: smaller;
                text-align: center;
            }
            img {
                margin-top: 5px;
                margin-bottom: 5px;
                border-radius: 50%;
                height: 90px;
                width: 90px;
                border: 3px solid;
                border-color: transparent;
                border-color: rgba(255, 255, 255, 0.7);
            }
            .profile-container {
                height: 90px;
                background-color: #B66DFF;
            }
            .card {
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                border-radius: 5px;
                padding: 20px;
            }
            @media screen and (max-width: 1000px) {
                .card {
                    margin-bottom: 20px;
                }
            }
        </style>

        <div style="height: 250px;">
            <div class="profile-container">
                <article class="card">
                    <figure>
                        <img src="${this.src}" alt="${this.alt}">
                        <figcaption>${this.caption}</figcaption>
                    </figure>
                    <p>${this.quote}</p>
                </article>
            </div>
        </div>        
      `;
    }
}

customElements.define("widget-profile", WidgetProfile);