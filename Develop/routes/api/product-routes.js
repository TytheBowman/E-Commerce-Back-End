const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({ include: [Tag, Category] });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, { include: [Tag, Category] });
    res.status(200).json(productData || { message: 'No product found with that id!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds) {
      const productTags = req.body.tagIds.map(tag_id => ({ product_id: product.id, tag_id }));
      await ProductTag.bulkCreate(productTags);
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [rowsAffected] = await Product.update(req.body, { where: { id: req.params.id } });
    if (!rowsAffected) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    await ProductTag.destroy({ where: { product_id: req.params.id } });
    if (req.body.tagIds) {
      const productTags = req.body.tagIds.map(tag_id => ({ product_id: req.params.id, tag_id }));
      await ProductTag.bulkCreate(productTags);
    }
    res.status(200).json({ message: `Product ${req.params.id} updated successfully.` });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const rowsAffected = await Product.destroy({ where: { id: req.params.id } });
    if (!rowsAffected) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json({ message: `Product ${req.params.id} deleted successfully.` });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
