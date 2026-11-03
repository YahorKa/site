use crate::components::{about::About, contacts::Contacts, formpage::FormPage, gallery::Gallery, homepage::HomePage, services::Services,
                        };
use yew::prelude::*;
use yew_router::prelude::*;

#[derive(Routable, PartialEq, Clone, Debug)]
pub enum Route {
    #[at("/")]
    Home,
    #[at("/form")]
    Form,
    #[not_found]
    #[at("/404")]
    NotFound,
    #[at("/about")]
    About,
    #[at("/services")]
    Services,
    #[at("/contacts")]
    Contacts,
     #[at("/gallery")]
    Gallery,
}   

pub fn switch(route: Route) -> Html {
    match route {
        Route::Home => html! { <HomePage /> },
        Route::Form => html! { <FormPage /> },  
        Route::About => html! { <About /> },
        Route::Services => html! { <Services /> },
        Route::Contacts => html! { <Contacts /> },
        Route::Gallery => html! { <Gallery /> },
        Route::NotFound => html! {
                                <div class="not-found">
                                    <img src="/404.png" alt="404 Not Found" />
                                    <h2>{ "Страница не найдена" }</h2>
                                    <a href="/">{ "Вернуться на главную" }</a>
                                </div>
                                }, 
    }
}
