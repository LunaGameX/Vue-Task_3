let eventBus = new Vue()

Vue.component('cards-kanban', {
    template: `
    <div>
        <fill></fill>
        <div id="columns">
            <column1 :column1="column1"></column1>
            <column2 :column2="column2"></column2>
            <column3 :column3="column3"></column3>
            <column4 :column4="column4"></column4>
        </div>
    </div>
    `,
    data() {
        return {
            column1: [],
            column2: [],
            column3: [],
            column4: [],
            showCard: true,
        }
    },
    methods: {},
    mounted() {
        eventBus.$on('card-create', card => {
            this.column1.push(card)
        })
        eventBus.$on('moving1', card => {
            this.column2.push(card)
            this.column1.splice(this.column1.indexOf(card), 1)

        })
        eventBus.$on('moving2', card => {
            this.column3.push(card)
            this.column2.splice(this.column2.indexOf(card), 1)
        })

        eventBus.$on('moving3-2', card => {
            this.column2.push(card)
            this.column3.splice(this.column3.indexOf(card), 1)
            card.dateE = new Date().toLocaleDateString()
        })

        eventBus.$on('moving3-4', card => {
            this.column4.push(card)
            this.column3.splice(this.column3.indexOf(card), 1)
            card.dateE = new Date().toLocaleDateString()
            card.dateE = card.dateE.split('.').reverse().join('-')
            console.log(card)
            if (card.dateE > card.dateD) {
                card.inTime = false
            }
        })
    }
})

Vue.component('fill', {    //дата создания, заголовок, описание задачи, дедлайн
    template: `
    <div xmlns="http://www.w3.org/1999/html">
    <div>
        <button v-if="!show" @click="openModal" id="buttonModal">Добавьте задачу</button>
        <div id="form" v-if="show" class="modal-shadow">
            <div class="modal">
                <div class="modal-close" @click="closeModal">&#10006;</div>
                <h3>Заполните карточку задачи</h3>
                <form @submit.prevent="onSubmit">
                    <p class="pForm">Введите заголовок: </br>
                        <input required type="text" v-model="title" maxlength="30" placeholder="Заголовок">
                    </p>
                    <p class="pForm">Добавьте описание задаче: </p>
                    <textarea v-model="description" wrap="hard" cols="40" rows="4"></textarea>
                    <p class="pForm">Укажите дату дедлайна: </br>
                        <input required type="date" v-model="dateD">
                    </p>
                    <p class="pForm">
                        <input class="button" type="submit" value="Добавить задачу">
                    </p>
                </form>
            </div>
        </div>    
    </div>
    `,
    data() {
        return {
            title: null,
            description: null,
            dateD: null,
            show: false
        }
    },
    methods: {
        onSubmit() {
            let card = {
                title: this.title,
                description: this.description,
                dateD: this.dateD,                     //дата дедлайна
                dateC: new Date().toLocaleString(),   //дата создания
                updateCard: false,
                dateL: null,                            //дата последних изменений
                dateE: null,                            //дата выполнения
                inTime: true,                           //в срок или нет
                reason: []
            }
            eventBus.$emit('card-create', card)
            this.title = null
            this.description = null
            this.dateD = null
            this.closeModal()
            console.log(card)
        },
        closeModal() {
            this.show = false
        },
        openModal() {
            this.show = true
        }
    }
})

Vue.component('column1', {  //создание, удаление, редактирование карточки, время последнего редактирования
    props: {                 // перемещение карточки во второй столбец
        card: {
            type: Object,
            required: true
        },
        column1: {
            type: Array,
            required: true
        },
    },
    template: `
    <div class="column">
        <h3>Запланированные задачи</h3>
        <div class="card" v-for="card in column1">
            <ul>
                <li class="title"><b>Заголовок:</b></br> {{ card.title }}</li>
                <li id="contexts"><b>Описание задачи:</b></br> {{ card.description }}</li>
                <li><b>Дата дедлайна:</b></br> {{ card.dateD }}</li>
                <li><b>Дата создания:</b></br> {{ card.dateC }}</li>
                <li v-if="card.dateL"><b>Дата последних изменений</b></br>{{ card.dateL }}</li>
                <button @click="updateC(card)" id="buttonUpdate">Изменить</button>
                <button @click="deleteCard(card)" id="buttonDelete">Удалить</button>
                <div class="change" v-if="card.updateCard">
                    <form @submit.prevent="updateTask(card)">
                        <p>Введите заголовок: </br>
                            <input type="text" v-model="card.title" maxlength="30" placeholder="Заголовок">
                        </p>
                        <p>Добавьте описание задаче: 
                            <textarea v-model="card.description" cols="20" rows="5"></textarea>
                        </p>
                        <p>Укажите дату дедлайна: 
                            <input type="date" v-model="card.dateD">
                        </p>
                        <p>
                             <input class="button" type="submit" value="Изменить карточку">
                        </p>
                    </form>
                </div>
             </ul>
            <button @click="moving(card)" id="buttonNow">==></button>
        </div>
    </div>
    `,
    methods: {
        deleteCard(card) {
            this.column1.splice(this.column1.indexOf(card), 1)
        },
        updateC(card) {
            card.updateCard = true
            console.log(card.updateCard)
        },
        updateTask(card) {
            this.column1.push(card)
            this.column1.splice(this.column1.indexOf(card), 1)
            card.dateL = new Date().toLocaleString()
            return card.updateCard = false
        },
        moving(card) {
            eventBus.$emit('moving1', card)
        }
    },
})

Vue.component('column2', {  //редактирование, время последнего редактирования, перемещение в третий столб
    props: {
        column2: {
            type: Array,
            required: true
        },
        card: {
            type: Object,
            required: true
        },
        reason: {
            type: Array,
            required: true
        }
    },
    template: `
    <div class="column">
        <h3>Задачи в работе</h3>
         <div class="card" v-for="card in column2">
            <ul>
                 <li class="title"><b>Заголовок:</b></br> {{ card.title }}</li>
                <li><b>Описание задачи:</b></br> {{ card.description }}</li>
                <li><b>Дата дедлайна:</b></br> {{ card.dateD }}</li>
                <li><b>Дата создания:</b></br> {{ card.dateC }}</li>
                <li v-if="card.dateL"><b>Дата последних изменений</b></br>{{ card.dateL }}</li>
                <li v-if="card.reason.length"><b>Комментарии: </b><li v-for="r in card.reason">{{ r }}</li></li>
                <button @click="updateC(card)" id="buttonUpdate">Изменить</button>
                 <div class="change" v-if="card.updateCard">
                    <form @submit.prevent="updateTask(card)">
                        <p>Введите заголовок: 
                            <input type="text" v-model="card.title" maxlength="30" placeholder="Заголовок">
                        </p>
                        <p>Добавьте описание задаче: 
                            <textarea v-model="card.description" cols="20" rows="5"></textarea>
                        </p>
                        <p>Укажите дату дедлайна: 
                            <input type="date" v-model="card.dateD">
                        </p>
                        <p>
                            <input class="button" type="submit" value="Изменить карточку">
                        </p>
                    </form>
                </div>
            </ul>
             <button @click="moving(card)" id="buttonNow">==></button>
        </div>        
    </div>
    `,
    methods: {
        updateC(card) {
            card.updateCard = true
            console.log(card.updateCard)
        },
        updateTask(card) {
            this.column2.push(card)
            this.column2.splice(this.column2.indexOf(card), 1)
            card.dateL = new Date().toLocaleString()
            return card.updateCard = false
        },
        moving(card) {
            eventBus.$emit('moving2', card)
        }
    },
})

Vue.component('column3', {  //редактирование, время последнего редактирования
    props: {                 //перемещение в 4 столб, перемещение во 2 столб + причина возврата
        column3: {
            type: Array,
            required: true
        },
        card: {
            type: Object,
            required: true
        },
        reason: {
            type: Array,
            required: true
        }
    },

    template: `
    <div class="column">
        <h3>Тестирование</h3>
        <div class="card" v-for="card in column3">
            <ul>
                <li class="title"><b>Заголовок:</b> {{ card.title }}</li>
                <li><b>Описание задачи:</b> {{ card.description }}</li>
                <li><b>Дата дедлайна:</b> {{ card.dateD }}</li>
                <li><b>Дата создания:</b> {{ card.dateC }}</li>
                <li v-if="card.dateL"><b>Дата последних изменений: </b>{{ card.dateL }}</li>
                <li v-if="card.reason.length"><b>Комментарии: </b><li v-for="r in card.reason">{{ r }}</li></li>
                <li v-if="moveBack">Комментарий: </br>
                    <form @submit.prevent="onSubmit(card)">
                        <textarea v-model="reason2" cols="20" rows="4"></textarea>
                        <input class="button" type="submit" value="Сохранить">
                    </form>
                </li>
                <button @click="updateC(card)" id="buttonUpdate">Изменить</button>
                 <div class="change" v-if="card.updateCard">
                    <form @submit.prevent="updateTask(card)">
                        <p>Введите заголовок: 
                            <input type="text" v-model="card.title" maxlength="30" placeholder="Заголовок">
                        </p>
                        <p>Добавьте описание задаче: 
                            <textarea v-model="card.description" cols="20" rows="5"></textarea>
                        </p>
                        <p>Укажите дату дедлайна: 
                            <input type="date" v-model="card.dateD">
                        </p>
                        <p>
                              <input class="button" type="submit" value="Изменить карточку">
                        </p>
                    </form>
                </div>
            </ul>
            <button @click="movingBack" id="buttonBack"><==</button>
            <button @click="moving(card)" id="buttonNow">==></button>
        </div>    
    </div>
    `,

    data() {
        return {
            moveBack: false,
            reason2: null
        }
    },
    methods: {
        updateC(card) {
            card.updateCard = true
            console.log(card.updateCard)
        },
        updateTask(card) {
            this.column3.push(card)
            this.column3.splice(this.column3.indexOf(card), 1)
            card.dateL = new Date().toLocaleString()
            return card.updateCard = false
        },
        moving(card) {
            eventBus.$emit('moving3-4', card)
        },
        movingBack() {
            this.moveBack = true
        },
        onSubmit(card) {
            card.reason.push(this.reason2)
            eventBus.$emit('moving3-2', card)
            this.reason2 = null
            this.moveBack = true
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {}
})