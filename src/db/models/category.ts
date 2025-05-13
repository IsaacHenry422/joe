//  import { Schema, model, Document, Types, Model } from 'mongoose';

// // Interface with additional virtuals and methods
// interface ICategory extends Document {
//   name: string;
//   slug: string;
//   parent?: Types.ObjectId | ICategory;
//   isMainCategory: boolean;
//   createdAt: Date;
//   updatedAt: Date;
  
//   // Virtuals
//   readonly fullPath: string;
// }

// interface ICategoryModel extends Model<ICategory> {
//   findBySlug(slug: string): Promise<ICategory | null>;
// }

// const categorySchema = new Schema<ICategory, ICategoryModel>({
//   name: { 
//     type: String, 
//     required: true, 
//     trim: true,
//     maxlength: [50, 'Category name cannot exceed 50 characters']
//   },
//   slug: { 
//     type: String, 
//     unique: true, 
//     lowercase: true,
//     match: [/^[a-z0-9-]+$/, 'Slug must contain only letters, numbers and hyphens']
//   },
//   parent: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'Category', 
//     default: null,
//     validate: {
//       validator: async function(this: ICategory, value: Types.ObjectId) {
//         if (!value) return true;
//         const parent = await model('Category').findById(value);
//         return parent?.isMainCategory;
//       },
//       message: 'Parent category must be a main category'
//     }
//   },
//   isMainCategory: { 
//     type: Boolean, 
//     default: false 
//   }
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Virtual for full category path (e.g. "parent/child")
// categorySchema.virtual('fullPath').get(function(this: ICategory) {
//   return this.parent 
//     ? `${(this.parent as ICategory).slug}/${this.slug}`
//     : this.slug;
// });

// // Static method
// categorySchema.statics.findBySlug = async function(slug: string) {
//   return this.findOne({ slug }).populate('parent');
// };

// // Auto-create/update slug
// categorySchema.pre<ICategory>('save', function(next) {
//   if (this.isModified('name') || !this.slug) {
//     this.slug = this.name.toLowerCase()
//       .replace(/\s+/g, '-')
//       .replace(/[^\w-]+/g, '');
//   }
//   next();
// });

// // Cascade delete subcategories when main category is deleted
// categorySchema.post('deleteOne', { document: true, query: false }, async function(this: ICategory) {
//   await model('Category').deleteMany({ parent: this._id });
// });

// export const Category = model<ICategory, ICategoryModel>('Category', categorySchema);
import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface with additional virtuals and methods
export interface ICategory extends Document { // Add the 'export' keyword here
  name: string;
  slug: string;
  parent?: Types.ObjectId | ICategory;
  isMainCategory: boolean;
  createdAt: Date;
  updatedAt: Date;

// Virtuals
 readonly fullPath: string;
}

interface ICategoryModel extends Model<ICategory> {
 findBySlug(slug: string): Promise<ICategory | null>;
}

const categorySchema = new Schema<ICategory, ICategoryModel>({
 name: {
  type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug must contain only letters, numbers and hyphens']
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    validate: {
      validator: async function(this: ICategory, value: Types.ObjectId) {
        if (!value) return true;
        const parent = await model('Category').findById(value);
        return parent?.isMainCategory;
      },
      message: 'Parent category must be a main category'
    }
  },
  isMainCategory: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full category path (e.g. "parent/child")
categorySchema.virtual('fullPath').get(function(this: ICategory) {
  return this.parent
    ? `${(this.parent as ICategory).slug}/${this.slug}`
    : this.slug;
});

// Static method
categorySchema.statics.findBySlug = async function(slug: string) {
  return this.findOne({ slug }).populate('parent');
};

// Auto-create/update slug
categorySchema.pre<ICategory>('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }
  next();
});

// Cascade delete subcategories when main category is deleted
categorySchema.post('deleteOne', { document: true, query: false }, async function(this: ICategory) {
  await model('Category').deleteMany({ parent: this._id });
});

export const Category = model<ICategory, ICategoryModel>('Category', categorySchema);