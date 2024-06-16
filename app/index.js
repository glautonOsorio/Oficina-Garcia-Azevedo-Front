import { Link, useRouter } from "expo-router";
import { Image, Text, View, StyleSheet, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function Index() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (e) {
      console.error("Failed to fetch the token.", e);
      return null;
    }
  };

  const getUser = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert("Error", "Authentication token not found");
      return;
    }
    try {
      const response = await fetch("http://localhost:3333/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log(result.user);
        setUser(result.user);
        await AsyncStorage.setItem("user", JSON.stringify(result.user));
        Alert.alert("Success", "User details retrieved successfully");
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to retrieve user details"
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while retrieving user details. Please try again."
      );
      console.error(error);
    }
  };
  const deleteUser = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Error", "Authentication token not found");
      return;
    }
    try {
      const response = await fetch("http://localhost:3333/users/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        await LogOff();
        Alert.alert("Success", "User deleted successfully");
      } else {
        const result = await response.json();
        Alert.alert("Error", result.message || "Failed to delete user");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while deleting the user. Please try again."
      );
      console.error("Error deleting user:", error);
    }
  };

  const LogOff = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
      Alert.alert("Success", "Logged off successfully");
      router.push("/");
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while logging off. Please try again."
      );
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (token) {
        await getUser();
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../assets/favicon.png")}
          style={{ width: "100%" }}
          resizeMode="contain"
        />
      </View>
      {user != null ? (
        <View style={styles.containerUser}>
          <Text style={styles.title}>Bem vindo! {user.userName}</Text>
          <Text style={styles.text}>Essas são os seus dados</Text>
          <Text style={styles.text}>Email: {user.email}</Text>
          <Text style={styles.text}>CPF: {user.cpf}</Text>
          <Text style={styles.text}>Gênero: {user.gender}</Text>
          <Text style={styles.text}>Telefone: {user.phoneNumber}</Text>
          <View style={styles.containerButton}>
            <Pressable style={styles.buttonOptions} onPress={LogOff}>
              <Text style={styles.buttonText}>Logoff</Text>
            </Pressable>
            <Link href={"/cadastro"} asChild>
              <Pressable style={styles.buttonOptions}>
                <Text style={styles.buttonText}>Atualizar</Text>
              </Pressable>
            </Link>
            <Pressable style={styles.buttonOptions} onPress={deleteUser}>
              <Text style={styles.buttonText}>Deletar </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.containerForm}>
          <Text style={styles.title}>
            Bem vindo ao App da Oficina GarciaAzevedo!
          </Text>
          <Text style={styles.text}>O que deseja fazer?</Text>
          <View style={styles.containerButton}>
            <Link href={"/login"} asChild>
              <Pressable style={styles.buttonOptions}>
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>
            </Link>
            <Link href={"/cadastro"} asChild>
              <Pressable style={styles.buttonOptions}>
                <Text style={styles.buttonText}>Cadastro</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#192841",
  },
  containerLogo: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  containerUser: {
    flex: 2,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: "5%",
    paddingEnd: "5%",

    padding: "5%",
    justifyContent: "center",
    alignItems: "center",
  },
  containerForm: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: "5%",
    paddingEnd: "5%",
  },
  containerButton: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    justifyContent: "center",

    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 12,
  },
  text: {
    color: "#888888",
    marginBottom: 30,
    fontSize: 18,
  },
  button: {
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#192841",
    padding: 10,
    width: "35%",
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
