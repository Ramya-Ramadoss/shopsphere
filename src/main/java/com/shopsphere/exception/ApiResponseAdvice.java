package com.shopsphere.exception;

import com.shopsphere.util.ApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        Class<?> parameterType = returnType.getParameterType();
        
        // If it's a ResponseEntity, extract its generic type to prevent wrapping nested ErrorResponse
        if (org.springframework.http.ResponseEntity.class.isAssignableFrom(parameterType)) {
            java.lang.reflect.Type genericType = returnType.getGenericParameterType();
            if (genericType instanceof java.lang.reflect.ParameterizedType) {
                java.lang.reflect.Type[] actualTypeArguments = ((java.lang.reflect.ParameterizedType) genericType).getActualTypeArguments();
                if (actualTypeArguments.length > 0) {
                    java.lang.reflect.Type firstArg = actualTypeArguments[0];
                    if (firstArg instanceof Class) {
                        Class<?> actualClass = (Class<?>) firstArg;
                        if (actualClass.equals(ApiResponse.class) || 
                            actualClass.equals(ErrorResponse.class) || 
                            actualClass.equals(Void.class) || 
                            actualClass.equals(byte[].class)) {
                            return false;
                        }
                    }
                }
            }
        }
        
        // Do not wrap if already ApiResponse, ErrorResponse, Void, or raw byte arrays (e.g. invoice downloads)
        return !parameterType.equals(ApiResponse.class) &&
               !parameterType.equals(ErrorResponse.class) &&
               !parameterType.equals(void.class) &&
               !parameterType.equals(Void.class) &&
               !parameterType.equals(byte[].class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        // Wrap the response body in the standard ApiResponse structure
        return ApiResponse.builder()
                .success(true)
                .message("Operation completed successfully")
                .data(body)
                .build();
    }
}
