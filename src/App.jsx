import axios from 'axios'
import { useState } from 'react'
import './assets/all.scss'

const { VITE_API_BASE, VITE_API_PATH} = import.meta.env;

function App() {
  const [ isAuthorized, setIsAuthorized ] = useState(false);
  const [ loginFormData, setLoginFormData ] = useState({
    username: '',
    password: ''
  })
  const [ products, setProducts ] = useState([]);
  const [ tempProduct, setTempProduct ] = useState({});

  const handleLoginFormData = (e) => {
    const { name, value } = e.target;
    setLoginFormData({
      ...loginFormData,
      [name]: value
    })
  }

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${VITE_API_BASE}/admin/signin`, loginFormData);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      alert(res.data.message);
      setIsAuthorized(true);
      getData();
    } catch (error) {
      setIsAuthorized(false);
      alert(error.response.data.message);
    }
  }

  const checkLogin = async() => {
    try{
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      const res = await axios.post(`${VITE_API_BASE}/api/user/check`, {}, {
          headers: {
            Authorization: token
          }
        })
      setIsAuthorized(true);
      alert('驗證成功');
    }
    catch (error) {
      setIsAuthorized(false);
      alert(error.response.data.message);
    }
  }

  const getData = async () => {
    try{
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      const res = await axios.get(`${VITE_API_BASE}/api/${VITE_API_PATH}/admin/products`, {
        headers: {
          Authorization: token
        }
      });
      setProducts(res.data.products);
    }
    catch(error){
      alert(error.response.data.message);
    }
  }

  return (
    <>
      <div className="container mt-5">
        {
          !isAuthorized ? (
            <div className="row justify-content-center">
              <div className="col-md-4">
                <form onSubmit={login}>
                  <div className="form-floating mb-3">
                    <input type="text" id="username" name="username" placeholder="email@example.com" className="form-control" onChange={handleLoginFormData} />
                    <label htmlFor="username">帳號</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input type="password" id="password" name="password" placeholder="password" className="form-control" onChange={handleLoginFormData} />
                    <label htmlFor="password">密碼</label>
                  </div>
                  <button className="btn btn-primary w-100">登入</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="row mt-5">
              <div className="col-12">
                <button type="button" className="btn btn-primary" onClick={checkLogin}>驗證是否登入</button>
              </div>
              <div className="col-md-6">
                <h2>產品列表</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">產品名稱</th>
                      <th scope="col">原價</th>
                      <th scope="col">售價</th>
                      <th scope="col">是否啟用</th>
                      <th scope="col">查看細節</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      products.map((product) => {
                        return (
                          <tr key={product.id}>
                            <td>{ product.title }</td>
                            <td>{ product.origin_price }</td>
                            <td>{ product.price }</td>
                            <td>{ product.is_enabled ? <span className="text-success">已啟用</span> : "未啟用" }</td>
                            <td>
                              <button type="button" className="btn btn-primary" onClick={() => {
                                setTempProduct(product);
                              }}>查看細節</button>
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h2>單一產品細節</h2>
                {
                  Object.keys(tempProduct).length ? (
                    <div className="card">
                      <img src={tempProduct.imageUrl} alt="主圖" className="card-img-top object-fit primary-image"/>
                      <div className="card-body">
                        <h5>
                          {tempProduct.title}
                          <span className="badge text-bg-primary ms-2">{tempProduct.category}</span>
                        </h5>
                        <p className="card-text">產品描述： {tempProduct.description}</p>
                        <p className="card-text">產品內容： {tempProduct.content}</p>
                        <p className="card-text">
                          $ <del className="text-secondary">{tempProduct.origin_price}</del> / {tempProduct.price} 元
                        </p>
                        <h5>更多圖片：</h5>
                        {
                          tempProduct.imagesUrl?.map((url, i) => {
                            return (
                              <img src={url} key={i} className="images me-2"/>
                            )
                          })
                        }
                      </div>
                    </div>
                  ) : <p className="text-secondary">請選擇一個商品查看</p>
                }
              </div>
            </div>
          )
        }
      </div>
    </>
  )
}

export default App
