package com.integrador.chantilly.shared.security;

import com.integrador.chantilly.auth.security.AuthCookieService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthCookieService authCookieService;

    public JwtFilter(JwtUtil jwtUtil,
                     UserDetailsServiceImpl userDetailsService,
                     TokenBlacklistService tokenBlacklistService,
                     AuthCookieService authCookieService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.authCookieService = authCookieService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String jwt = resolveJwt(request);
        if (jwt == null || jwt.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }
        if (tokenBlacklistService.isBlacklisted(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String username;

        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (Exception ex) {
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveJwt(HttpServletRequest request) {
        String cookieToken = authCookieService.resolveToken(request);
        if (cookieToken != null && !cookieToken.isBlank()) {
            return cookieToken;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }
}
