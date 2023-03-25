# Unity中的基础光照
标准光照模型由以下四部分组成：
- 自发光
- 高光反射
- 漫反射
- 环境光
# 漫反射光照模型
$$c_diffuse = c_light · M_diffuse · max(0,n·l);$$
## 逐顶点漫反射光照模型
```shaderlab

Shader "Custom/Test641"
{
    max(0,n·l)=>saturate(dot(worldNormal,worldLight)
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