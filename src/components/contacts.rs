use yew::prelude::*;

#[function_component(Contacts)]
pub fn contacts() -> Html {
    html! {
        <div class="contacts-page">
            <h1>{"Контакты"}</h1>

            <section>
                <h2>{"Адрес"}</h2>
                <p>{"г. Жодино, ул. Деревянко, 3 ДВОРЕЦ КУЛЬТУРЫ"}</p>
                <div class="map-wrapper">
                    <iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae55adb7f6eb88de03fc96654ca3aec003d14c2a54cc5cfb7bc8757f08f6d2a0f&amp;source=constructor" width="564" height="368" frameborder="0" loading="lazy">
                    </iframe>    
                </div>       
            </section>

            <section>
                <h2>{"Телефон"}</h2>
                <p><a href="tel:+375257187257">{"+375 (25) 718-72-57"}</a></p>
            </section>

            <section>
                <h2>{"Email"}</h2>
                <p><a href="mailto:info@izostudio.by">{"info@izostudio.by"}</a></p>
            </section>

            <section>
                <h2>{"Часы работы"}</h2>
                <p>{"Пн–Пт: 10:00–19:00"}<br />{"Сб–Вс: 11:00–16:00"}</p>
            </section>

            <section>
                <h2>{"Мы в соцсетях"}</h2>
                <ul>
                    <li><a href="https://t.me/nastaMua" target="_blank">{"Telegram"}</a></li>
                    <li><a href="https://www.instagram.com/izo_studia_zhodino?utm_source=qr&igsh=dGZ3aGhmbjhweTFj" target="_blank">{"Instagram"}</a></li>
                </ul>
            </section>
        </div>
    }
}
