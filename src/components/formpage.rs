use yew::prelude::*;

#[function_component(FormPage)]
pub fn form_page() -> Html {
    html! {
        <div class="form-page">
            <h2>{ "Запись на обучение" }</h2>

            <form class="enroll-form">
                <label>
                    { "Имя родителя" }
                    <input type="text" name="parent_name" required = true />
                </label>

                <label>
                    { "Имя ребёнка" }
                    <input type="text" name="child_name" required = true />
                </label>

                <label>
                    { "Возраст ребёнка" }
                    <input type="number" name="child_age" min="3" max="18" required = true />
                </label>

                <label>
                    { "Направление" }
                    <select name="direction">
                        <option disabled = true selected = true>{ "Выберите" }</option>
                        <option>{ "Живопись" }</option>
                        <option>{ "Графика" }</option>
                        <option>{ "Скульптура" }</option>
                        <option>{ "Декоративное искусство" }</option>
                    </select>
                </label>

                <button type="submit">{ "Отправить заявку" }</button>
            </form>
        </div>
    }
}
