'use strict';

class SliderCarousel {
    /**
     * @param main {string} wrapper слайдера
     * @param numberSlider {number} номер слайдера
     * @param wrap {string} wrapper слайдов
     * @param position {number} номер первого слайда
     * @param next {string} кнопка next
     * @param prev {string} кнопка prev
     * @param showToSlides {number} количество слайдов для показа
     * @param infinity {boolean} режим бесконечности
     * @param responsive {array} массив с параметрами для адаптивности
     */
    constructor({
                    main,
                    numberSlider = 0,
                    wrap,
                    position = 0,
                    next,
                    prev,
                    showToSlides = 3,
                    infinity = false,
                    responsive = []
                }) {
        /**
         * Обработка отсутствия необходимых свойств
         */
        if (!wrap || !main) {
            console.warn('slider-carousel: Необходимо 2 свойства, "main" и "wrap"')
        }
        /**
         *
         * @type {Element}
         * @this {SliderCarousel}
         * @param widthOneSlide {string} вычисляем ширину одного слайда
         * @param options {object} опции для слайдера
         * @param slides {array} массив слайдов (классы)
         */
        this.main = document.querySelector(main);
        this.wrap = document.querySelector(wrap);
        this.slides = document.querySelector(wrap).children;
        this.next = document.querySelector(next);
        this.prev = document.querySelector(prev);
        this.showToSlides = showToSlides;
        this.numberSlider = numberSlider;
        this.widthOneSlide = window.innerWidth * 0.9 / showToSlides;
        this.options = {
            position,
            widthSlides: 100 / this.showToSlides,
            infinity
        };
        this.responsive = responsive;
    }

    /**
     * инициализация слайдера
     *  @this {SliderCarousel}
     */
    init() {
        this.addGloClass();
        this.addStyle();
        if (this.prev && this.next) {
            this.controlSlider();
        } else {
            this.addArrow();
            this.controlSlider();
        }
        if (this.options.position < this.slides.length - this.showToSlides) {
            this.wrap.style.transform = `translateX(-${this.options.position * this.options.widthSlides}%)`;
        } else {
            console.warn('Укажите значение position меньше. Установлено значение position по умолчанию = 0!!!')
        }
        if (this.responsive) {
            this.responseInit();
        }
        this.swipe();
        this.swipeMouse();
    }

    /**
     * добавление классов к wrap и main
     *  @this {SliderCarousel}
     */
    addGloClass() {
        this.main.classList.add(`glo-slider${this.numberSlider}`);
        this.wrap.classList.add(`glo-slider__wrap${this.numberSlider}`);
        for (const item of this.slides) {
            item.classList.add(`glo-slider__item${this.numberSlider}`)
        }
    }

    /**
     * добавление css свойств к main и wrap
     *  @this {SliderCarousel}
     *  @param style {string} id тега <style/>
     */
    addStyle() {
        let style = document.getElementById(`sliderCarousel-style${this.numberSlider}`);
        if (!style) {
            style = document.createElement('style');
            style.id = `sliderCarousel-style${this.numberSlider}`;
        }
        style.textContent = `
        .glo-slider${this.numberSlider} {
        width: 90%;
        overflow: hidden;
        margin: 0 auto;
        }
        
        .glo-slider__wrap${this.numberSlider} {
        display: flex;
        transition: transform 0.5s;
        will-change: transform;
        text-align: center;
        }
        
        .glo-slider__item${this.numberSlider} {
        flex: 0 0 ${this.options.widthSlides}%;
        margin: 0 auto  ;
        }
        `;
        document.head.appendChild(style)
    }

    /**
     * вешаем события на кнопки prev и next
     *  @this {SliderCarousel}
     */
    controlSlider() {
        this.prev.addEventListener('click', this.prevSlider);
        this.next.addEventListener('click', this.nextSlider);
    }

    /**
     * @this {SliderCarousel}
     * обработка события нажатия на кнопку prev
     */
    prevSlider = () => {
        if (this.options.infinity || this.options.position > 0) {
            --this.options.position;
            if (this.options.position < 0) {
                this.options.position = this.slides.length - this.showToSlides;
            }
            this.wrap.style.transform = `translateX(-${this.options.position * this.options.widthSlides}%)`;
        }
    }
    /**
     * @this {SliderCarousel}
     * обработка события нажатия на кнопку next
     */
    nextSlider = () => {
        if (this.options.infinity || this.options.position < this.slides.length - this.showToSlides) {
            ++this.options.position;
            // console.log(this.options.position);
            if (this.options.position > this.slides.length - this.showToSlides) {
                this.options.position = 0;
            }
            this.wrap.style.transform = `translateX(-${this.options.position * this.options.widthSlides}%)`;
        }
    }

    /**
     * создание кнопок если пользователь не передал свои
     * @this {SliderCarousel}
     */
    addArrow() {
        this.prev = document.createElement('button');
        this.next = document.createElement('button');

        this.prev.className = 'glo-slider__prev';
        this.next.className = 'glo-slider__next';

        this.main.appendChild(this.prev);
        this.main.appendChild(this.next);

        const style = document.createElement('style');
        style.textContent = `
        .glo-slider__prev,
        .glo-slider__next{
        margin: 0 10px;
        border: 20px solid transparent;
        background: transparent;
        }
        .glo-slider__next {
        border-left-color: #19b5fe;
        position: absolute;
        top: 37%;
        right: 0;
        }
       .glo-slider__prev {
        border-right-color: #19b5fe;
        position: absolute;
        top: 37%;
        left: 0;
        }
        .glo-slider__prev:hover,
        .glo-slider__next:hover{
        cursor: pointer;
        }
        .glo-slider__prev:hover,
        .glo-slider__next:hover,
        .glo-slider__prev:hover,
        .glo-slider__next:focus{
        background: transparent;
        outline: transparent;
        }
        `;
        document.head.appendChild(style);
    }

    /**
     * @this {SliderCarousel}
     * @param slidesToShowDefault {number} сохраняем showToSlides перед изменением
     * @param allResponse {array} переносим responsive в allResponse
     * @param maxResponse {string} находим максимальное значение брекпоинта
     * @param widthWindow {string} узнаем разрешение экрана
     */
    responseInit() {
        const slidesToShowDefault = this.showToSlides;
        const allResponse = this.responsive.map(item => item.breakPoint);
        const maxResponse = Math.max(...allResponse);
        const checkResponse = () => {
            const widthWindow = document.documentElement.clientWidth;
            if (widthWindow < maxResponse) {
                for (let i = 0; i < allResponse.length; i++) {
                    if (widthWindow < allResponse[i]) {
                        this.showToSlides = this.responsive[i].slideToShow;
                        this.options.widthSlides = 100 / this.showToSlides;
                        this.addStyle();
                    }
                }
            } else {
                this.showToSlides = slidesToShowDefault;
                this.options.widthSlides = 100 / this.showToSlides;
                this.addStyle();
            }
        };
        checkResponse();
        window.addEventListener('resize', checkResponse);
    }

    /**
     * @this {SliderCarousel}
     * реализация свайпов слайдера
     * @param arrayClientX {array} создаем массив для сохранения положений касания
     * @param a {string} конкретное значение положения касания
     * @param swipeDistance {string} расстояние от начала касания до конца
     */
    swipe() {
        let arrayClientX = [];
        document.querySelector(`.glo-slider${this.numberSlider}`).addEventListener('touchmove', (e) => {
            let a = e.targetTouches[0].clientX;
            arrayClientX.push(a);
        })
        document.querySelector(`.glo-slider${this.numberSlider}`).addEventListener('touchend', (e) => {
            let swipeDistance = arrayClientX[0] - arrayClientX[arrayClientX.length - 1]
            if (this.widthOneSlide * 0.5 <= swipeDistance) {
                this.nextSlider()
            } else if (-(this.widthOneSlide) * 0.5 >= swipeDistance) {
                this.prevSlider()
            }
            arrayClientX = []
        })
    }
}


