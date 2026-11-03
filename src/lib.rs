mod components;
mod routes;

use components::footer::Footer;
use components::header::Header;
use routes::{Route, switch};
use wasm_bindgen::prelude::*;
use yew::Renderer;
use yew::prelude::*;
use yew_router::prelude::*;

#[function_component(App)]
fn app() -> Html {
    html! {
        <BrowserRouter>
            <Header />
            // <div class="art-background-left">
            // <img src="/icons/art-background-left.svg" alt="Палитра слева" />
            // </div>
            // <div class="art-background-right">
            // </div>
            <main>
            <Switch<Route> render={switch} />
            </main>
            <Footer />
        </BrowserRouter>
    }
}

#[wasm_bindgen(start)]
pub fn start() {
    Renderer::<App>::new().render();
}
