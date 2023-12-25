import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
    history: createWebHistory(),
    routes: [{
            path: "/main",
            name: "Main",
            component: () =>
                import ("../views/main/game.vue"),
        },
        {
            path: "/login",
            name: "login",
            component: () =>
                import ("../views/Register_login/Register_login.vue"),
        },
        {
            path: "/",
            redirect: {
                name: "Main",
            },
        },
    ],
});

export default router;