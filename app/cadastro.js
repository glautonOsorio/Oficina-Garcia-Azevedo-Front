import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  userName: yup.string().required("Informe seu nome completo"),
  email: yup
    .string()
    .email("Informe um email válido")
    .required("Informe seu email"),
  password: yup.string().min(6, "A senha deve ter pelo menos 6 dígitos"),
  phoneNumber: yup
    .string()
    .required("Informe um número de telefone")
    .min(11, "Informe seu telefone com DDD"),
  cpf: yup
    .string()
    .required("Informe seu CPF")
    .min(11, "Informe um CPF válido"),
});
function Cadastro() {
  const [showPassword, setShowPassword] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const unformat = (value) => {
    return value.replace(/\D/g, "");
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setToken(token);
          setShowPassword(false);
          const user = await AsyncStorage.getItem("user");
          const parsedUser = JSON.parse(user);
          setValue("userName", parsedUser.userName);
          setValue("email", parsedUser.email);
          setValue("cpf", unformat(parsedUser.cpf));
          setValue("phoneNumber", unformat(parsedUser.phoneNumber));
        } else {
          setShowPassword(true);
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      }
    };

    fetchData();
  }, [setValue]);

  const Submit = async (data) => {
    const body = { ...data, gender: "male" };

    if (showPassword) {
      try {
        const response = await fetch("http://localhost:3333/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        if (response.ok) {
          router.push("/login");
          Alert.alert("Success", "User registered successfully");
        } else {
          Alert.alert("Error", result.message || "Failed to register user");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An error occurred while registering. Please try again."
        );
        console.error("Error registering user:", error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:3333/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(result.message);
          router.push("/");
          Alert.alert("Success", "User data updated successfully");
        } else {
          console.log(result.message);
          console.error("Failed to update user data", result);
          Alert.alert("Error", result.message || "Failed to update user data");
        }
      } catch (error) {
        console.error("Error occurred while updating data", error);
        Alert.alert(
          "Error",
          "An error occurred while updating data. Please try again."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerHeader}>
        <Text style={styles.textHeader}>Página Cadastro</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputContainerTitle}>Nome de usuário:</Text>
        <Controller
          control={control}
          name="userName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.inputStyle}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Insira seu nome completo"
            />
          )}
        />
        {errors.userName && (
          <Text style={styles.labelErrorText}>{errors.userName.message}</Text>
        )}

        <Text style={styles.inputContainerTitle}>E-mail:</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.inputStyle}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Insira seu email"
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.labelErrorText}>{errors.email.message}</Text>
        )}

        {showPassword && (
          <>
            <Text style={styles.inputContainerTitle}>Senha:</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.inputStyle}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder="Insira uma senha"
                  secureTextEntry={true}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.labelErrorText}>
                {errors.password.message}
              </Text>
            )}
          </>
        )}

        <Text style={styles.inputContainerTitle}>CPF:</Text>
        <Controller
          control={control}
          name="cpf"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.inputStyle}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Insira seu CPF"
              maxLength={11}
              keyboardType="numeric"
            />
          )}
        />
        {errors.cpf && (
          <Text style={styles.labelErrorText}>{errors.cpf.message}</Text>
        )}

        <Text style={styles.inputContainerTitle}>Número de telefone:</Text>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.inputStyle}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              maxLength={11}
              placeholder="Insira seu numero de telefone"
              keyboardType="numeric"
            />
          )}
        />
        {errors.phoneNumber && (
          <Text style={styles.labelErrorText}>
            {errors.phoneNumber.message}
          </Text>
        )}
        <View style={styles.containerButton}>
          {showPassword ? (
            <Link href={"/login"} asChild>
              <Pressable style={styles.buttonOptions}>
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>
            </Link>
          ) : (
            <Link href={"/"} asChild>
              <Pressable style={styles.buttonOptions}>
                <Text style={styles.buttonText}>Home</Text>
              </Pressable>
            </Link>
          )}
          <Pressable
            style={styles.buttonOptions}
            onPress={handleSubmit(Submit)}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#192841",
  },
  containerHeader: {
    marginTop: "14%",
    marginBottom: "8%",
    paddingStart: "5%",
  },

  containerButton: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  textHeader: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },

  inputContainer: {
    backgroundColor: "#fff",
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: "5%",
    paddingEnd: "5%",
  },

  inputContainerTitle: {
    fontSize: 16,
    marginTop: 28,
    color: "#192841",
  },

  inputStyle: {
    borderBottomWidth: 1,
    height: 40,
    marginBottom: 12,
    fontSize: 12,
  },
  labelErrorText: {
    marginBottom: 4,
    color: "#ef4444",
  },
  buttonOptions: {
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#192841",
    padding: 10,
    width: "35%",
    margin: 16,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default Cadastro;
