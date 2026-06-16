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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
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
                .andReturn();

        String authCookie = loginResult.getResponse().getCookie("CHANTILLY_ACCESS_TOKEN").getValue();
        mockMvc.perform(get("/api/auth/session").cookie(new jakarta.servlet.http.Cookie("CHANTILLY_ACCESS_TOKEN", authCookie)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("lucia@test.com"));
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
                    .andExpect(status().isUnprocessableEntity());
        }

        mockMvc.perform(loginRequest)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"))
                .andExpect(jsonPath("$.message", containsString("demasiados intentos")));
    }
}
