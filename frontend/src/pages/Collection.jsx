import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);

  // Filter States
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [material, setMaterial] = useState([]);
  const [returnable, setReturnable] = useState(null);
  const [inStock, setInStock] = useState(null);
  const [sortType, setSortType] = useState('relavent');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const toggleFilterArray = (value, setter, state) => {
    if (state.includes(value)) {
      setter(state.filter((item) => item !== value));
    } else {
      setter([...state, value]);
    }
  };

  const applyFilter = () => {
    let filtered = [...products];

    if (showSearch && search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      filtered = filtered.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      filtered = filtered.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    if (material.length > 0) {
      filtered = filtered.filter((item) =>
        material.includes(item.material)
      );
    }

    if (returnable !== null) {
      filtered = filtered.filter((item) => item.returnable === returnable);
    }

    if (inStock !== null) {
      filtered = filtered.filter((item) => item.inStock === inStock);
    }

    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      filtered = filtered.filter(
        (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
      );
    }

    setFilterProducts(filtered);
  };

  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setPriceRange(newPriceRange);
  };

  const sortProduct = () => {
    const sorted = [...filterProducts];
    switch (sortType) {
      case 'low-high':
        setFilterProducts(sorted.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(sorted.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, material, returnable, inStock, priceRange, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // ✅ RESET FILTERS
  const resetFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setMaterial([]);
    setReturnable(null);
    setInStock(null);
    setSortType('relavent');
    setPriceRange([0, 5000]);
  };

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filters */}
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilter(!showFilter)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=''
          />
        </p>

        {/* Reset Button */}
        <button onClick={resetFilters} className='text-xs text-gray-500 hover:text-black'>
            Reset All
          </button>

        {/* Category */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          {['Men', 'Women', 'Kids'].map((cat) => (
            <label className='flex gap-2 text-sm text-gray-700' key={cat}>
              <input
                type='checkbox'
                value={cat}
                checked={category.includes(cat)}
                onChange={(e) => toggleFilterArray(e.target.value, setCategory, category)}
              />
              {cat}
            </label>
          ))}
        </div>

        {/* Subcategory */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          {['Topwear', 'Bottomwear', 'Winterwear'].map((type) => (
            <label className='flex gap-2 text-sm text-gray-700' key={type}>
              <input
                type='checkbox'
                value={type}
                checked={subCategory.includes(type)}
                onChange={(e) => toggleFilterArray(e.target.value, setSubCategory, subCategory)}
              />
              {type}
            </label>
          ))}
        </div>

        {/* Material */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>MATERIAL</p>
          {['Cotton', 'Wool', 'Polyester'].map((mat) => (
            <label className='flex gap-2 text-sm text-gray-700' key={mat}>
              <input
                type='checkbox'
                value={mat}
                checked={material.includes(mat)}
                onChange={(e) => toggleFilterArray(e.target.value, setMaterial, material)}
              />
              {mat}
            </label>
          ))}
        </div>

        {/* Returnable */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>RETURNABLE</p>
          <label className='flex gap-2 text-sm text-gray-700'>
            <input
              type='radio'
              name='returnable'
              checked={returnable === true}
              onChange={() => setReturnable(true)}
            />
            Yes
          </label>
          <label className='flex gap-2 text-sm text-gray-700'>
            <input
              type='radio'
              name='returnable'
              checked={returnable === false}
              onChange={() => setReturnable(false)}
            />
            No
          </label>
        </div>

        {/* In Stock */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>AVAILABILITY</p>
          <label className='flex gap-2 text-sm text-gray-700'>
            <input
              type='radio'
              name='inStock'
              checked={inStock === true}
              onChange={() => setInStock(true)}
            />
            In Stock
          </label>
          <label className='flex gap-2 text-sm text-gray-700'>
            <input
              type='radio'
              name='inStock'
              checked={inStock === false}
              onChange={() => setInStock(false)}
            />
            Out of Stock
          </label>
        </div>

        {/* Price Range */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>PRICE RANGE</p>
          <div className='flex flex-col gap-4'>
            <div className='flex justify-between'>
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <div className='flex flex-col gap-2'>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1='ALL' text2='COLLECTIONS' />
          <select
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
            className='border-2 border-gray-300 text-sm px-2'
          >
            <option value='relavent'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
