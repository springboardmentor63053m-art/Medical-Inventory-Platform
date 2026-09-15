package com.medistock.medistockbackend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class HomeController {

    @GetMapping(value = {
        "/",
        "/login",
        "/register",
        "/signup",
        "/{path:[^\\.]*}",
        "/{path1:[^\\.]*}/{path2:[^\\.]*}"
    })
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.startsWith("/api") || uri.startsWith("/v3") || uri.startsWith("/swagger-ui")) {
            return null;
        }
        return "forward:/index.html";
    }
}
