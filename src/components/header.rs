use crate::Route;
use yew::prelude::*;
use yew_router::prelude::*;

#[function_component(Header)]
pub fn header() -> Html {
    html! {
        <header class="site-header">
             <div class="logo">
                <Link<Route> to={Route::Home}>
                   <div class="logo-combo">
                        <img src="/icons/iconBlack.png" alt="Izo Studio Logo" class="logo-icon" />
                        <span class="logo-text">{ "Izo Studio" }</span>
                 </div>
                </Link<Route>>
            </div>
            <nav class="nav-menu">
                <Link<Route> to={Route::Home}>{ "Главная" }</Link<Route>>
                <Link<Route> to={Route::About}>{ "О нас" }</Link<Route>>
                <Link<Route> to={Route::Services}>{ "Услуги" }</Link<Route>>
                <Link<Route> to={Route::Contacts}>{ "Контакты" }</Link<Route>>
                <Link<Route> to={Route::Gallery}>{ "Галерея" }</Link<Route>>
            </nav>
            <a class="contact-phone" href="tel:+375257187257">
                { "+375 (25) 718-72-57" }
            </a>
        </header>
    }
}
