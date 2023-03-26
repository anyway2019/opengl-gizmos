# Unity 中的基础光照

标准光照模型由以下四部分组成：

- 自发光
- 高光反射
- 漫反射
- 环境光

# 漫反射光照模型

$$c_diffuse = c_light · M_diffuse · max(0,n·l);$$
//max(0,n·l)=>saturate(dot(worldNormal,worldLight)

## 逐顶点漫反射光照模型

![](/assets/diffuse-vertexLevel.jpg)

```shaderlab

Shader "Custom/Test641"
{
    Properties
    {
       _Diffuse("Diffuse",color) = (1,1,1,1)
    }
    SubShader
    {
        Pass{
            Tags{"LightMode" = "ForwardBase"}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "Lighting.cginc"
            fixed4 _Diffuse;

            struct a2v
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 pos : SV_POSITION;
                fixed3 color : COLOR;
            };

            v2f vert(a2v v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                //获取环境光
                fixed3 ambient = UNITY_LIGHTMODEL_AMBIENT.xyz;
                //法线向量由自身的模型坐标转换成世界坐标 法线变量转换矩阵为顶点转换矩阵的逆转置矩阵
                float3 worldNormal = normalize(mul(v.normal, (float3x3)unity_WorldToObject));
                //获取世界坐标下入射光
                float3 worldLight = normalize(_WorldSpaceLightPos0.xyz);

                fixed3 diffuse = _LightColor0.rgb * _Diffuse.rgb * saturate(dot(worldNormal,worldLight));

                o.color = ambient + diffuse;
                return o;
            }

            fixed4 frag(v2f o):SV_Target
            {
                return fixed4(o.color,1);
            }

            ENDCG
        }
    }
    FallBack "Diffuse"
}


```

# 漫反射逐像素光照模型

本质是上就是将计算光渣模型的过程转移到片元着色器中。
![](/assets/diffuse-pixelLevel.jpg)

```
// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Custom/Test642"
{
    Properties
    {
      _Diffuse("Diffuse",color)=(1,1,1,1)
    }
    SubShader
    {
        Pass {

            Tags { "LightModel"="ForwardBases" }
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "Lighting.cginc"

            fixed4 _Diffuse;

            struct a2f
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 pos: SV_POSITION;
                fixed3 worldNormal: TEXTCOORD0;
            };

            v2f vert(a2f a)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(a.vertex);
                //法线向量转化成世界坐标
                o.worldNormal = mul(a.normal, (float3x3)unity_WorldToObject);
                return o;
            }

            fixed4 frag(v2f o):SV_Target
            {
                //获取环境光
                fixed3 ambient = UNITY_LIGHTMODEL_AMBIENT.xyz;
                //获取法线向量
                fixed3 normal = normalize(o.worldNormal);
                //获取光源方向
                fixed3 lightDir = normalize(_WorldSpaceLightPos0.xyz);
                //计算光照强度
                fixed3 diffuse = _LightColor0.rgb * _Diffuse.rgb * saturate(dot(normal, lightDir));
                //计算漫反射光照模型
                fixed3 lighting = ambient + diffuse;
                //返回漫反射光照模型
                return fixed4(lighting, 1);
            }

            ENDCG
        }
    }
    FallBack "Diffuse"
}

```

# 半兰伯特模型

![](/assets/half-lambert.jpg)

```
  // other code above
  //计算光照强度
  fixed3 diffuse = _LightColor0.rgb * _Diffuse.rgb * (dot(normal, lightDir)*0.5f+0.5f);
```

# 高光反射模型

反射方向计算：r=l-2(dot(n,l))n,unity 中的内置函数 reflect(i,n);

## 逐顶点

![](/assets/specular-vertexLevel.jpg)

```
Shader "Custom/Test644"
{
    Properties
    {
       _Diffuse("Diffuse",color) = (1,1,1,1)
       _Specular("Specular",color) = (1,1,1,1)
       _Glossy("Glossy",Range(8.0,256)) = 20
    }
    SubShader
    {
        Pass{
            Tags{"LightMode" = "ForwardBase"}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "Lighting.cginc"

            fixed4 _Diffuse;
            fixed4 _Specular;
            float _Glossy;

            struct a2v
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 pos : SV_POSITION;
                fixed3 color : COLOR;
            };

            v2f vert(a2v v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                //获取环境光
                fixed3 ambient = UNITY_LIGHTMODEL_AMBIENT.xyz;
                //法线向量由自身的模型坐标转换成世界坐标 法线变量转换矩阵为顶点转换矩阵的逆转置矩阵
                float3 worldNormal = normalize(mul(v.normal, (float3x3)unity_WorldToObject));
                //获取世界坐标下入射光
                float3 worldLight = normalize(_WorldSpaceLightPos0.xyz);

                fixed3 diffuse = _LightColor0.rgb * _Diffuse.rgb * saturate(dot(worldNormal,worldLight));

                //计算反射光：四个参数 入射光方向与颜色 材质的反射系数 视角方向 反射方向 gloss反射区域的大小

                //获取反射光方向
                fixed3 reflecrDir = normalize(reflect(-worldLight,worldNormal));

                //获取摄像机视觉方向
                fixed3 viewDir = normalize(_WorldSpaceCameraPos.xyz - mul(unity_ObjectToWorld,v.vertex).xyz);

                //计算反射光
                fixed3 specular = _LightColor0.rgb*_Specular.rgb*pow(saturate(dot(reflecrDir,viewDir)),_Glossy);

                o.color = ambient + diffuse + specular;
                return o;
            }

            fixed4 frag(v2f o):SV_Target
            {
                return fixed4(o.color,1);
            }

            ENDCG
        }
    }
    FallBack "Specular"
}
```

## 逐像素

![](/assets/specular-pixelLevel.jpg)

```
Shader "Custom/Test645"
{
    Properties
    {
       _Diffuse("Diffuse",color) = (1,1,1,1)
       _Specular("Specular",color) = (1,1,1,1)
       _Glossy("Glossy",Range(8.0,256)) = 20
    }
    SubShader
    {
        Pass{
            Tags{"LightMode" = "ForwardBase"}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "Lighting.cginc"

            fixed4 _Diffuse;
            fixed4 _Specular;
            float _Glossy;

            struct a2v
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 pos: SV_POSITION;
                fixed3 worldNormal: TEXTCOORD0;
                float3 worldPos : TEXCOORD1;
            };

            v2f vert(a2v v)
            {
                v2f o;

                o.pos = UnityObjectToClipPos(v.vertex);
                o.worldNormal = mul(v.normal,(float3x3)unity_WorldToObject);
                o.worldPos = mul(unity_ObjectToWorld,v.vertex);
                return o;
            }

            fixed4 frag(v2f o):SV_Target
            {
                 //获取环境光
                fixed3 ambient = UNITY_LIGHTMODEL_AMBIENT.xyz;
                //法线向量由自身的模型坐标转换成世界坐标 法线变量转换矩阵为顶点转换矩阵的逆转置矩阵
                float3 worldNormal = normalize(o.worldNormal);
                //获取世界坐标下入射光
                float3 worldLight = normalize(_WorldSpaceLightPos0.xyz);

                fixed3 diffuse = _LightColor0.rgb * _Diffuse.rgb * saturate(dot(worldNormal,worldLight));

                //计算反射光：四个参数 入射光方向与颜色 材质的反射系数 视角方向 反射方向 gloss反射区域的大小

                //获取反射光方向
                fixed3 reflecrDir = normalize(reflect(-worldLight,worldNormal));

                //获取摄像机视觉方向
                fixed3 viewDir = normalize(_WorldSpaceCameraPos.xyz - o.worldPos.xyz);

                //计算反射光
                fixed3 specular = _LightColor0.rgb*_Specular.rgb*pow(saturate(dot(reflecrDir,viewDir)),_Glossy);

                fixed3 light = ambient + diffuse + specular;
                return fixed4(light,1);
            }

            ENDCG
        }
    }
    FallBack "Specular"
}
```

# Blinn-Phong 光照模型

```
Shader "Custom/Test646"
{
    Properties
    {
       _Diffuse("Diffuse",color) = (1,1,1,1)
       _Specular("Specular",color) = (1,1,1,1)
       _Glossy("Glossy",Range(8.0,256)) = 20
    }
    SubShader
    {
        Pass{
            Tags{"LightMode" = "ForwardBase"}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "Lighting.cginc"

            fixed4 _Diffuse;
            fixed4 _Specular;
            float _Glossy;

            struct a2v
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 pos: SV_POSITION;
                fixed3 worldNormal: TEXTCOORD0;
                float3 worldPos : TEXCOORD1;
            };

            v2f vert(a2v v)
            {
                v2f o;

                o.pos = UnityObjectToClipPos(v.vertex);
                o.worldNormal = mul(v.normal,(float3x3)unity_WorldToObject);
                o.worldPos = mul(unity_ObjectToWorld,v.vertex).xyz;
                return o;
            }

            fixed4 frag(v2f o):SV_Target
            {
                 //获取环境光
                fixed3 ambient = UNITY_LIGHTMODEL_AMBIENT.xyz;
                //法线向量由自身的模型坐标转换成世界坐标 法线变量转换矩阵为顶点转换矩阵的逆转置矩阵
                float3 worldNormal = normalize(o.worldNormal);
                //获取世界坐标下入射光
                float3 worldLight = normalize(_WorldSpaceLightPos0.xyz);

                fixed3 diffuse = _LightColor0.rgb * _Diffuse.rgb * saturate(dot(worldNormal,worldLight));

                //计算反射光：四个参数 入射光方向与颜色 材质的反射系数 视角方向 反射方向 gloss反射区域的大小

                //获取反射光方向
                fixed3 reflecrDir = normalize(reflect(-worldLight,worldNormal));

                //获取摄像机视觉方向
                fixed3 viewDir = normalize(_WorldSpaceCameraPos.xyz - o.worldPos.xyz);

                //获取half方向
                fixed3 halfDir = normalize(worldLight + viewDir);

                //计算反射光
                fixed3 specular = _LightColor0.rgb*_Specular.rgb*pow(saturate(dot(reflecrDir,halfDir)),_Glossy);

                fixed3 light = ambient + diffuse + specular;
                return fixed4(light,1);
            }

            ENDCG
        }
    }
    FallBack "Specular"
}
```
