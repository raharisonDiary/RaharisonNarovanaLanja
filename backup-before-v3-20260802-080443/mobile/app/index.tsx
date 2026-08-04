import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../src/auth/AuthContext'
import { colors } from '../src/styles/theme'
export default function Index(){const {user,loading}=useAuth();if(loading)return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={colors.primary}/></View>;return <Redirect href={user?"/(tabs)":"/login"}/>}
