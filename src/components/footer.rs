use yew::prelude::*;

#[function_component(Footer)]
pub fn footer() -> Html {
    html! {
        <footer class="site-footer">
            <div class="footer-content">
                <p>{ "© 2025 Художественная школа IzoStudio. Все права защищены." }</p>
                <p>{ "Сайт носит исключительно информационный характер. Продажа товаров и оказание услуг через сайт не осуществляется." }</p>
                <p>{ "Ремесленная деятельность осуществляется в соответствии с Указом Президента РБ №364 от 09.10.2017." }</p>
                <div class="social-links">
                   <a href="https://t.me/nastaMua" target="_blank" class="social-link">
                        <img src="/icons/telegram1.svg" alt="Telegram" class="social-icon" />
                        { "Telegram" }
                    </a>
                    <a href="https://www.instagram.com/izo_studia_zhodino?utm_source=qr&igsh=dGZ3aGhmbjhweTFj" target="_blank" class="social-link">
                        <img src="/icons/insta1.svg" alt="Insta" class="social-icon" /> { "Instagram" }
                    </a>
                </div>
            </div>
        </footer>
    }
}
