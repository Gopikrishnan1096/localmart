/**
 * EditProductPage - Edit existing product
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import API from '../utils/api';
import { ProductForm } from './AddProductPage';
import toast from 'react-hot-toast';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (form, imageFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) formData.append(key, val);
      });
      if (imageFile) formData.append('image', imageFile);

      await API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><div className="spinner" /></div>;

  return (
    <div>
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', textDecoration: 'none', fontWeight: '600', marginBottom: '20px', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Products
      </Link>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Edit Product</h1>
      {product && <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} title="Edit Product Details" />}
    </div>
  );
};

export default EditProductPage;
