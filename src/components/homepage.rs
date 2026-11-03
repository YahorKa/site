use yew::prelude::*;

#[function_component(HomePage)]
pub fn home_page() -> Html {
    html! {
        <div class="home-page">
            <h1>{ "Студия рисования" }</h1>

            <div class="layout-row">
                <div class="main-content">
                    <section>
                        <h2>{ "О нас" }</h2>
                        <p>
                            { "Мы обучаем детей разного возраста живописи, графике, скульптуре и декоративному искусству. Занятия ведут опытные педагоги." }
                        </p>

                        // <h3>{ "Посмотрите, как рисуют наши ученики" }</h3>
                        // <div class="preview-gallery">
                        //     <img src="/gallery/work1.jpg" alt="Работа ученика 1" />
                        //     <img src="/gallery/work2.jpg" alt="Работа ученика 2" />
                        //     <img src="/gallery/work3.jpg" alt="Работа ученика 3" />
                        // </div>

                        <h2>{ "Наши направления" }</h2>
                        <ul>
                            <li>{ "Живопись" }</li>
                            <li>{ "Графика" }</li>
                            <li>{ "Лепка" }</li>
                            <li>{ "Декоративное искусство" }</li>
                        </ul>

                        <h2>{ "Запись на обучение" }</h2>
                        <p>{ "Если вы хотите записать ребёнка на занятия, заполните онлайн-заявку. Или записаться по телефону +375(25)718-72-57" }</p>
                        // <button onclick={Callback::from(|_| {
                        //     web_sys::window()
                        //         .unwrap()
                        //         .location()
                        //         .set_href("/form")
                        //         .unwrap();
                        // })}>
                        //     { "Подать заявку" }
                        // </button>
                    </section>
                </div>

                <div class="ad-image">
                    <a href="https://www.instagram.com/izo_studia_zhodino/p/DNkmW06q4XC/" target="_blank" rel="noopener noreferrer">
                        <img src="/gallery/advertisment.jpg" alt="Рекламный баннер" />
                    </a>
                </div>
            </div>
        </div>
    }
}
