package com.shopsphere.util;

public class ValidationUtil {

    private ValidationUtil() {
    }

    public static boolean isNull(Object object) {
        return object == null;
    }

    public static boolean isNotNull(Object object) {
        return object != null;
    }

    public static boolean isEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }
}