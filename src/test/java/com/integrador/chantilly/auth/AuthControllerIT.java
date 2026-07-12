package com.integrador.chantilly.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrador.chantilly.auth.dto.LoginRequest;
import com.integrador.chantilly.auth.dto.RegisterRequest;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.repository.RoleRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.cors.allowed-origin-patterns=https://casadelchantilly-frontend.vercel.app,http://localhost:5173,http://localhost:3000",
        "app.auth.cookie.same-site=None",
        "app.auth.cookie.secure=true",
        "app.csrf.cookie.same-site=None",
        "app.csrf.cookie.secure=true"
})
class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        roleRepository.deleteAll();
        roleRepository.save(new Role("CLIENTE"));
    }

    @Test
    void registerAndLoginFlowWorks() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNombre("Lucia");
        registerRequest.setApellido("Prueba");
        registerRequest.setEmail("lucia@test.com");
        registerRequest.setTelefono("987654321");
        registerRequest.setPassword("clave123");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensaje").value("Usuario registrado exitosamente"));

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("lucia@test.com");
        loginRequest.setPassword("clave123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isEmpty())
                .andExpect(jsonPath("$.rol").value("CLIENTE"))
                .andExpect(cookie().exists("CHANTILLY_ACCESS_TOKEN"))
                .andExpect(cookie().value("CHANTILLY_ACCESS_TOKEN", org.hamcrest.Matchers.not(org.hamcrest.Matchers.isEmptyOrNullString())))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Set-Cookie", containsString("SameSite=None")))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Set-Cookie", containsString("Secure")))
                .andReturn();

        String authCookie = loginResult.getResponse().getCookie("CHANTILLY_ACCESS_TOKEN").getValue();
        mockMvc.perform(get("/api/auth/session").cookie(new jakarta.servlet.http.Cookie("CHANTILLY_ACCESS_TOKEN", authCookie)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("lucia@test.com"));
    }

    @Test
    void loginWithoutCsrfTokenRemainsAccessibleForPublicAuthFlow() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNombre("Lucia");
        registerRequest.setApellido("Prueba");
        registerRequest.setEmail("lucia-nocsrf@test.com");
        registerRequest.setTelefono("987654321");
        registerRequest.setPassword("clave123");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("lucia-nocsrf@test.com");
        loginRequest.setPassword("clave123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("CHANTILLY_ACCESS_TOKEN"));
    }

    @Test
    void preflightForLoginAllowsConfiguredProductionOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://casadelchantilly-frontend.vercel.app")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://casadelchantilly-frontend.vercel.app"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void invalidRegisterPayloadReturnsFriendlyValidationStatus() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNombre(" ");
        registerRequest.setApellido(" ");
        registerRequest.setEmail("correo-invalido");
        registerRequest.setTelefono(" ");
        registerRequest.setPassword(" ");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void loginRateLimitReturnsFriendlyTooManyRequests() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNombre("Lucia");
        registerRequest.setApellido("Prueba");
        registerRequest.setEmail("lucia-limit@test.com");
        registerRequest.setTelefono("987654321");
        registerRequest.setPassword("clave123");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest wrongPasswordRequest = new LoginRequest();
        wrongPasswordRequest.setEmail("lucia-limit@test.com");
        wrongPasswordRequest.setPassword("mala-clave");

        MockHttpServletRequestBuilder loginRequest = post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPasswordRequest))
                .header("X-Forwarded-For", "192.168.10.5");

        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(loginRequest)
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
        }

        mockMvc.perform(loginRequest)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
                .andExpect(jsonPath("$.message", containsString("demasiados intentos")));
    }
}
